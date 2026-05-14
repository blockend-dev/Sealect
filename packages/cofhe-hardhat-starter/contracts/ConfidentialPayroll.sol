// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/**
 * @title ConfidentialPayroll
 * @notice FHE pay equity engine — employer submits encrypted team salaries,
 *         contract verifies compliance and pay equity fully on ciphertext.
 */
contract ConfidentialPayroll {
    struct Period {
        address employer;
        string name;
        uint128 minWage;
        uint256 employeeCount;
        uint256 submittedCount;
        uint256 groupZeroCount;
        uint256 groupOneCount;
        euint128 totalPayroll;
        euint128 allAboveMin;       // running AND of per-salary min-wage checks
        euint128 groupZeroTotal;
        euint128 groupOneTotal;
        euint128 certCheck;         // combined check queued for on-chain decryption
        bool certificationRequested;
        bool certified;
        bool passed;
    }

    uint256 public periodCount;
    mapping(uint256 => Period) private _periods;
    mapping(uint256 => mapping(address => bool))   public isEnrolled;
    mapping(uint256 => mapping(address => uint8))  public employeeGroup;
    mapping(uint256 => mapping(address => bool))   public hasSubmitted;
    // ctHash of each employee's individual salary — readable by them for decryptForView
    mapping(uint256 => mapping(address => uint256)) public salaryHandle;

    event PeriodCreated(uint256 indexed periodId, address indexed employer, string name, uint128 minWage);
    event EmployeeEnrolled(uint256 indexed periodId, address indexed employee, uint8 group);
    event SalarySubmitted(uint256 indexed periodId, address indexed employee);
    event CertificationRequested(uint256 indexed periodId);
    event PeriodCertified(uint256 indexed periodId, bool passed);

    error NotEmployer();
    error NotEnrolled();
    error AlreadySubmitted();
    error AlreadyEnrolled();
    error AlreadyCertified();
    error CertificationNotRequested();
    error CertificationNotReady();
    error NotAllSubmitted();
    error AlreadyCertificationRequested();
    error InvalidGroup();
    error InvalidMinWage();

    modifier onlyEmployer(uint256 periodId) {
        if (msg.sender != _periods[periodId].employer) revert NotEmployer();
        _;
    }

    //  Create a pay period 

    function createPeriod(string calldata name, uint128 minWage)
        external
        returns (uint256 periodId)
    {
        if (minWage == 0) revert InvalidMinWage();
        periodId = periodCount++;
        Period storage p = _periods[periodId];
        p.employer      = msg.sender;
        p.name          = name;
        p.minWage       = minWage;

        // Initialize FHE accumulators
        p.totalPayroll  = FHE.asEuint128(0); FHE.allowThis(p.totalPayroll);
        p.allAboveMin   = FHE.asEuint128(1); FHE.allowThis(p.allAboveMin); // identity for mul
        p.groupZeroTotal = FHE.asEuint128(0); FHE.allowThis(p.groupZeroTotal);
        p.groupOneTotal  = FHE.asEuint128(0); FHE.allowThis(p.groupOneTotal);

        emit PeriodCreated(periodId, msg.sender, name, minWage);
    }

    //  Employer enrolls an employee with a role group 
    // group 0 = reference group (e.g. role A), group 1 = comparison group (role B)

    function enrollEmployee(uint256 periodId, address employee, uint8 group)
        external
        onlyEmployer(periodId)
    {
        if (group > 1) revert InvalidGroup();
        if (isEnrolled[periodId][employee]) revert AlreadyEnrolled();

        isEnrolled[periodId][employee] = true;
        employeeGroup[periodId][employee] = group;

        Period storage p = _periods[periodId];
        p.employeeCount++;
        if (group == 0) p.groupZeroCount++;
        else p.groupOneCount++;

        emit EmployeeEnrolled(periodId, employee, group);
    }

    //  Employee submits encrypted salary 
    // Salary accumulates into group total and overall total.
    // allAboveMin becomes 0 permanently if any salary is below minWage.
    // Employee is granted ACL access to their own salary handle.

    function submitSalary(uint256 periodId, InEuint128 calldata encSalary) external {
        if (!isEnrolled[periodId][msg.sender]) revert NotEnrolled();
        if (hasSubmitted[periodId][msg.sender]) revert AlreadySubmitted();

        Period storage p = _periods[periodId];
        euint128 salary = FHE.asEuint128(encSalary);

        // Accumulate total payroll
        p.totalPayroll = FHE.add(p.totalPayroll, salary);
        FHE.allowThis(p.totalPayroll);

        // Min-wage check: salary > minWage–1 → salary >= minWage
        ebool passMin    = FHE.gt(salary, FHE.asEuint128(p.minWage - 1));
        euint128 passVal = FHE.select(passMin, FHE.asEuint128(1), FHE.asEuint128(0));
        // Multiply running check — becomes 0 permanently if any salary fails
        p.allAboveMin = FHE.mul(p.allAboveMin, passVal);
        FHE.allowThis(p.allAboveMin);

        // Accumulate group total
        uint8 grp = employeeGroup[periodId][msg.sender];
        if (grp == 0) {
            p.groupZeroTotal = FHE.add(p.groupZeroTotal, salary);
            FHE.allowThis(p.groupZeroTotal);
        } else {
            p.groupOneTotal = FHE.add(p.groupOneTotal, salary);
            FHE.allowThis(p.groupOneTotal);
        }

        // Grant employee personal ACL — they can decrypt their own salary via permit
        FHE.allow(salary, msg.sender);
        salaryHandle[periodId][msg.sender] = euint128.unwrap(salary);

        hasSubmitted[periodId][msg.sender] = true;
        p.submittedCount++;
        emit SalarySubmitted(periodId, msg.sender);
    }

    //  Employer requests on-chain certification 
    // Combines minWage check + pay equity check into one certCheck euint128.
    // Grants employer ACL to view aggregate handles via decryptForView.
    // Queues async on-chain decryption via FHE.decrypt.

    function requestCertification(uint256 periodId) external onlyEmployer(periodId) {
        Period storage p = _periods[periodId];
        if (p.certificationRequested) revert AlreadyCertificationRequested();
        if (p.certified) revert AlreadyCertified();
        if (p.submittedCount != p.employeeCount || p.submittedCount == 0) revert NotAllSubmitted();

        // Grant employer aggregate-level ACL for permit-based audit
        FHE.allow(p.totalPayroll,   msg.sender);
        FHE.allow(p.groupZeroTotal, msg.sender);
        FHE.allow(p.groupOneTotal,  msg.sender);

        // Build combined certification check
        euint128 certCheck;
        if (p.groupZeroCount > 0 && p.groupOneCount > 0) {
            // Equity check: group 0 avg >= group 1 avg
            // Cross-multiply to avoid division: zero_total * one_count vs one_total * zero_count
            euint128 zeroNorm = FHE.mul(p.groupZeroTotal, FHE.asEuint128(uint128(p.groupOneCount)));
            euint128 oneNorm  = FHE.mul(p.groupOneTotal,  FHE.asEuint128(uint128(p.groupZeroCount)));
            // Equity passes when one_avg <= zero_avg, i.e. oneNorm <= zeroNorm
            ebool gapExists  = FHE.gt(oneNorm, zeroNorm);
            euint128 equityVal = FHE.select(gapExists, FHE.asEuint128(0), FHE.asEuint128(1));
            certCheck = FHE.mul(p.allAboveMin, equityVal);
        } else {
            certCheck = p.allAboveMin;
        }

        p.certCheck = certCheck;
        FHE.allowThis(p.certCheck);

        // Queue async on-chain decryption — co-processor processes and stores result
        FHE.decrypt(p.certCheck);
        p.certificationRequested = true;
        emit CertificationRequested(periodId);
    }

    //  Anyone calls certify once co-processor has processed the decryption 

    function certify(uint256 periodId) external {
        Period storage p = _periods[periodId];
        if (!p.certificationRequested) revert CertificationNotRequested();
        if (p.certified) revert AlreadyCertified();

        (uint128 result, bool ready) = FHE.getDecryptResultSafe(p.certCheck);
        if (!ready) revert CertificationNotReady();

        p.passed    = result == 1;
        p.certified = true;
        emit PeriodCertified(periodId, p.passed);
    }

    //  View helpers 

    function getPeriod(uint256 periodId)
        external
        view
        returns (
            address employer,
            string memory name,
            uint128 minWage,
            uint256 employeeCount,
            uint256 submittedCount,
            uint256 groupZeroCount,
            uint256 groupOneCount,
            bool certificationRequested,
            bool certified,
            bool passed
        )
    {
        Period storage p = _periods[periodId];
        return (
            p.employer, p.name, p.minWage,
            p.employeeCount, p.submittedCount,
            p.groupZeroCount, p.groupOneCount,
            p.certificationRequested, p.certified, p.passed
        );
    }

    /// @notice ctHash of total payroll — employer decrypts via decryptForView after certification
    function getTotalPayrollHandle(uint256 periodId) external view returns (uint256) {
        return euint128.unwrap(_periods[periodId].totalPayroll);
    }

    /// @notice ctHash of group 0 total — employer decrypts via decryptForView
    function getGroupZeroHandle(uint256 periodId) external view returns (uint256) {
        return euint128.unwrap(_periods[periodId].groupZeroTotal);
    }

    /// @notice ctHash of group 1 total — employer decrypts via decryptForView
    function getGroupOneHandle(uint256 periodId) external view returns (uint256) {
        return euint128.unwrap(_periods[periodId].groupOneTotal);
    }
}
