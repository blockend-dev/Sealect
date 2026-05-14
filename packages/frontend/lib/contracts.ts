export const VENDOR_ADDRESS = (process.env.NEXT_PUBLIC_VENDOR_CONTRACT || "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const PAYMENT_ADDRESS = (process.env.NEXT_PUBLIC_PAYMENT_CONTRACT || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const INEUINT_ABI_TYPE = {
  type: "tuple",
  components: [
    { name: "ctHash", type: "uint256" },
    { name: "securityZone", type: "uint8" },
    { name: "utype", type: "uint8" },
    { name: "signature", type: "bytes" },
  ],
} as const;

export const PAYMENT_ABI =[
    {
      "inputs": [],
      "name": "AlreadyClaimed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientValue",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "got",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "expected",
          "type": "uint8"
        }
      ],
      "name": "InvalidEncryptedInput",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotRecipient",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TransferFailed",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "PaymentClaimed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "refHash",
          "type": "bytes32"
        }
      ],
      "name": "PaymentCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "claimPayment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getPaymentInfo",
      "outputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "escrowed",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "claimed",
          "type": "bool"
        },
        {
          "internalType": "bytes32",
          "name": "refHash",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "addr",
          "type": "address"
        }
      ],
      "name": "getReceivable",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paymentCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "receivable",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "ctHash",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "securityZone",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "utype",
              "type": "uint8"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct InEuint128",
          "name": "encAmount",
          "type": "tuple"
        },
        {
          "internalType": "bytes32",
          "name": "refHash",
          "type": "bytes32"
        }
      ],
      "name": "sendPayment",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    }
  ] as const;

// ── ConfidentialPayroll ABI ────────────────────────────────────────────────────

export const PAYROLL_ADDRESS = (process.env.NEXT_PUBLIC_PAYROLL_CONTRACT || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const PAYROLL_ABI =  [
    {
      "inputs": [],
      "name": "AlreadyCertificationRequested",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AlreadyCertified",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AlreadyEnrolled",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AlreadySubmitted",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "CertificationNotReady",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "CertificationNotRequested",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "got",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "expected",
          "type": "uint8"
        }
      ],
      "name": "InvalidEncryptedInput",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidGroup",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidMinWage",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotAllSubmitted",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotEmployer",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotEnrolled",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "int32",
          "name": "value",
          "type": "int32"
        }
      ],
      "name": "SecurityZoneOutOfBounds",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "periodId",
          "type": "uint256"
        }
      ],
      "name": "CertificationRequested",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "periodId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "employee",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "group",
          "type": "uint8"
        }
      ],
      "name": "EmployeeEnrolled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "periodId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "passed",
          "type": "bool"
        }
      ],
      "name": "PeriodCertified",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "periodId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "employer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint128",
          "name": "minWage",
          "type": "uint128"
        }
      ],
      "name": "PeriodCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "periodId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "employee",
          "type": "address"
        }
      ],
      "name": "SalarySubmitted",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "periodId",
          "type": "uint256"
        }
      ],
      "name": "certify",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint128",
          "name": "minWage",
          "type": "uint128"
        }
      ],
      "name": "createPeriod",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "periodId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "employeeGroup",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "periodId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "employee",
          "type": "address"
        },
        {
          "internalType": "uint8",
          "name": "group",
          "type": "uint8"
        }
      ],
      "name": "enrollEmployee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "periodId",
          "type": "uint256"
        }
      ],
      "name": "getGroupOneHandle",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "periodId",
          "type": "uint256"
        }
      ],
      "name": "getGroupZeroHandle",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "periodId",
          "type": "uint256"
        }
      ],
      "name": "getPeriod",
      "outputs": [
        {
          "internalType": "address",
          "name": "employer",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint128",
          "name": "minWage",
          "type": "uint128"
        },
        {
          "internalType": "uint256",
          "name": "employeeCount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "submittedCount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "groupZeroCount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "groupOneCount",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "certificationRequested",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "certified",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "passed",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "periodId",
          "type": "uint256"
        }
      ],
      "name": "getTotalPayrollHandle",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasSubmitted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "isEnrolled",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "periodCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "periodId",
          "type": "uint256"
        }
      ],
      "name": "requestCertification",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "salaryHandle",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "periodId",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "ctHash",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "securityZone",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "utype",
              "type": "uint8"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct InEuint128",
          "name": "encSalary",
          "type": "tuple"
        }
      ],
      "name": "submitSalary",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const;


// ── VendorSelection ABI ────────────────────────────────────────────────────────

export const VENDOR_ABI = [
    {
      "inputs": [],
      "name": "AlreadySubmitted",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "BelowDeposit",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "got",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "expected",
          "type": "uint8"
        }
      ],
      "name": "InvalidEncryptedInput",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotEligibleForRefund",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotRequester",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "RequestAlreadySettled",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "RequestNotActive",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "RequestNotEnded",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "int32",
          "name": "value",
          "type": "int32"
        }
      ],
      "name": "SecurityZoneOutOfBounds",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TransferFailed",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "vendor",
          "type": "address"
        }
      ],
      "name": "ProposalSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "vendor",
          "type": "address"
        }
      ],
      "name": "Refunded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "requester",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        }
      ],
      "name": "RequestCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "winner",
          "type": "address"
        }
      ],
      "name": "VendorSelected",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "claimDeposit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "durationSeconds",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "depositWei",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "wPrice",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "wQuality",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "wDelivery",
          "type": "uint8"
        }
      ],
      "name": "createRequest",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "vendor",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getEscrow",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getRequest",
      "outputs": [
        {
          "internalType": "address",
          "name": "requester",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "bestVendor",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "settled",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "depositWei",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "wPrice",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "wQuality",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "wDelivery",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "hasSubmitted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "requestCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "requests",
      "outputs": [
        {
          "internalType": "address",
          "name": "requester",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "internalType": "euint128",
          "name": "bestScore",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "bestVendor",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "settled",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "depositWei",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "wPrice",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "wQuality",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "wDelivery",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "winner",
          "type": "address"
        }
      ],
      "name": "selectVendor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "ctHash",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "securityZone",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "utype",
              "type": "uint8"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct InEuint128",
          "name": "encPrice",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "ctHash",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "securityZone",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "utype",
              "type": "uint8"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct InEuint128",
          "name": "encQuality",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "ctHash",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "securityZone",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "utype",
              "type": "uint8"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct InEuint128",
          "name": "encDelivery",
          "type": "tuple"
        }
      ],
      "name": "submitProposal",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ] as const

// ── BlindReview ABI ────────────────────────────────────────────────────────────

export const BLIND_REVIEW_ADDRESS = (process.env.NEXT_PUBLIC_REVIEW_CONTRACT || "0x0000000000000000000000000000000000000000") as `0x${string}`;

const INEUINT128_COMPONENTS = [
  { name: "ctHash",       type: "uint256" },
  { name: "securityZone", type: "uint8"   },
  { name: "utype",        type: "uint8"   },
  { name: "signature",    type: "bytes"   },
] as const;

export const BLIND_REVIEW_ABI =  [
    {
      "inputs": [],
      "name": "AlreadyReviewed",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "got",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "expected",
          "type": "uint8"
        }
      ],
      "name": "InvalidEncryptedInput",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidProposal",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotOrganizer",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "RoundAlreadyFinalized",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "RoundNotActive",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "RoundNotEnded",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "int32",
          "name": "value",
          "type": "int32"
        }
      ],
      "name": "SecurityZoneOutOfBounds",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "roundId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "submitter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        }
      ],
      "name": "ProposalAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "roundId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "reviewer",
          "type": "address"
        }
      ],
      "name": "ReviewSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "roundId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "organizer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "RoundCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "roundId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "winnerProposalId",
          "type": "uint256"
        }
      ],
      "name": "RoundFinalized",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "roundId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "summary",
          "type": "string"
        }
      ],
      "name": "addProposal",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "durationSeconds",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "wImpact",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "wFeasibility",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "wInnovation",
          "type": "uint8"
        }
      ],
      "name": "createRound",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "roundId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "roundId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "winnerProposalId",
          "type": "uint256"
        }
      ],
      "name": "finalizeRound",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "roundId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "getProposal",
      "outputs": [
        {
          "internalType": "address",
          "name": "submitter",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "summary",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "reviewCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "roundId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "getProposalScoreHandle",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "roundId",
          "type": "uint256"
        }
      ],
      "name": "getRound",
      "outputs": [
        {
          "internalType": "address",
          "name": "organizer",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "wImpact",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "wFeasibility",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "wInnovation",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "proposalCount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "winnerProposalId",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "finalized",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasReviewed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "roundCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "roundId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "ctHash",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "securityZone",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "utype",
              "type": "uint8"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct InEuint128",
          "name": "encImpact",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "ctHash",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "securityZone",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "utype",
              "type": "uint8"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct InEuint128",
          "name": "encFeasibility",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "ctHash",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "securityZone",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "utype",
              "type": "uint8"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct InEuint128",
          "name": "encInnovation",
          "type": "tuple"
        }
      ],
      "name": "submitReview",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const;

// ── SealedVote ABI ────────────────────────────────────────────────────────────

export const SEALED_VOTE_ADDRESS = (process.env.NEXT_PUBLIC_VOTE_CONTRACT || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const SEALED_VOTE_ABI = [
    {
      "inputs": [],
      "name": "AlreadyDecryptionRequested",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AlreadySettled",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AlreadyVoted",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "DecryptionNotReady",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "DecryptionNotRequested",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "got",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "expected",
          "type": "uint8"
        }
      ],
      "name": "InvalidEncryptedInput",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ProposalNotActive",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ProposalNotEnded",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "int32",
          "name": "value",
          "type": "int32"
        }
      ],
      "name": "SecurityZoneOutOfBounds",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "voter",
          "type": "address"
        }
      ],
      "name": "BallotCast",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "DecryptionRequested",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "proposer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "quorum",
          "type": "uint256"
        }
      ],
      "name": "ProposalCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "passed",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "uint128",
          "name": "yesCount",
          "type": "uint128"
        }
      ],
      "name": "ProposalSettled",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "ctHash",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "securityZone",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "utype",
              "type": "uint8"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct InEuint128",
          "name": "encVote",
          "type": "tuple"
        }
      ],
      "name": "castBallot",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "durationSeconds",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "quorum",
          "type": "uint256"
        }
      ],
      "name": "createProposal",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "getProposal",
      "outputs": [
        {
          "internalType": "address",
          "name": "proposer",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "quorum",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalVoters",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "decryptRequested",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "settled",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "passed",
          "type": "bool"
        },
        {
          "internalType": "uint128",
          "name": "revealedYes",
          "type": "uint128"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasVoted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "proposalCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "requestDecryption",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "settle",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const;

// ── IdentityGate ABI ───────────────────────────────────────────────────────────

export const IDENTITY_GATE_ADDRESS = (process.env.NEXT_PUBLIC_KYC_CONTRACT || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const IDENTITY_GATE_ABI = [
    {
      "inputs": [
        {
          "internalType": "uint128",
          "name": "_minAge",
          "type": "uint128"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "AlreadyVerified",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ConditionsNotMet",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "got",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "expected",
          "type": "uint8"
        }
      ],
      "name": "InvalidEncryptedInput",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoPendingKYC",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotAdmin",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "int32",
          "name": "value",
          "type": "int32"
        }
      ],
      "name": "SecurityZoneOutOfBounds",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "KYCSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "VerificationRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "Verified",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "admin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "decryptedResult",
          "type": "uint256"
        }
      ],
      "name": "claimVerified",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "isVerified",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "kycResultHandle",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "minAge",
      "outputs": [
        {
          "internalType": "uint128",
          "name": "",
          "type": "uint128"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "revokeVerification",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint128",
          "name": "_minAge",
          "type": "uint128"
        }
      ],
      "name": "setMinAge",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "ctHash",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "securityZone",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "utype",
              "type": "uint8"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct InEuint128",
          "name": "encAge",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "ctHash",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "securityZone",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "utype",
              "type": "uint8"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct InEuint128",
          "name": "encJurisdiction",
          "type": "tuple"
        }
      ],
      "name": "submitKYC",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newAdmin",
          "type": "address"
        }
      ],
      "name": "transferAdmin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "verifiedAt",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;
