// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/**
 * @title SealedVote
 * @notice FHE DAO voting — ballots accumulate homomorphically via FHE.add.
 *         Tally is revealed fully on-chain via FHE.decrypt + FHE.getDecryptResultSafe
 *         across two transactions — no client-side permit or off-chain step needed.
 *
 *         Ballot normalization: FHE.gt(encVote, 0) → FHE.select → euint128(0 or 1).
 *         This ensures a malicious voter cannot inflate the yes count beyond 1.
 */
contract SealedVote {
    struct Proposal {
        address proposer;
        string title;
        string description;
        uint256 deadline;
        uint256 quorum;
        euint128 yesCount;
        uint256 totalVoters;
        bool decryptRequested;
        bool settled;
        bool passed;
        uint128 revealedYes;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) private _proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, uint256 deadline, uint256 quorum);
    event BallotCast(uint256 indexed proposalId, address indexed voter);
    event DecryptionRequested(uint256 indexed proposalId);
    event ProposalSettled(uint256 indexed proposalId, bool passed, uint128 yesCount);

    error ProposalNotActive();
    error ProposalNotEnded();
    error AlreadyVoted();
    error DecryptionNotRequested();
    error DecryptionNotReady();
    error AlreadySettled();
    error AlreadyDecryptionRequested();

    modifier onlyActive(uint256 proposalId) {
        if (block.timestamp > _proposals[proposalId].deadline) revert ProposalNotActive();
        _;
    }

    modifier onlyEnded(uint256 proposalId) {
        if (block.timestamp <= _proposals[proposalId].deadline) revert ProposalNotEnded();
        _;
    }

    //  Create a proposal 

    function createProposal(
        string calldata title,
        string calldata description,
        uint256 durationSeconds,
        uint256 quorum
    ) external returns (uint256 proposalId) {
        proposalId = proposalCount++;
        Proposal storage p = _proposals[proposalId];
        p.proposer = msg.sender;
        p.title = title;
        p.description = description;
        p.deadline = block.timestamp + durationSeconds;
        p.quorum = quorum;
        p.yesCount = FHE.asEuint128(0);
        FHE.allowThis(p.yesCount);
        emit ProposalCreated(proposalId, msg.sender, title, p.deadline, quorum);
    }

    //  Cast an encrypted ballot 
    // encVote should be 0 (no) or 1 (yes). Normalized via FHE.gt + FHE.select so
    // any non-zero value is treated as 1 — a voter cannot inflate the tally.

    function castBallot(
        uint256 proposalId,
        InEuint128 calldata encVote
    ) external onlyActive(proposalId) {
        Proposal storage p = _proposals[proposalId];
        if (hasVoted[proposalId][msg.sender]) revert AlreadyVoted();

        euint128 vote = FHE.asEuint128(encVote);

        // Normalize: any nonzero vote → 1
        ebool isYes = FHE.gt(vote, FHE.asEuint128(0));
        euint128 normalizedVote = FHE.select(isYes, FHE.asEuint128(1), FHE.asEuint128(0));

        p.yesCount = FHE.add(p.yesCount, normalizedVote);
        FHE.allowThis(p.yesCount);
        p.totalVoters++;
        hasVoted[proposalId][msg.sender] = true;

        emit BallotCast(proposalId, msg.sender);
    }

    //  Request on-chain decryption of the tally 
    // Anyone can call after deadline. CoFHE co-processor processes asynchronously
    // and stores result in TaskManager — readable via getDecryptResultSafe.

    function requestDecryption(uint256 proposalId) external onlyEnded(proposalId) {
        Proposal storage p = _proposals[proposalId];
        if (p.decryptRequested) revert AlreadyDecryptionRequested();
        if (p.settled) revert AlreadySettled();

        p.decryptRequested = true;
        FHE.decrypt(p.yesCount);
        emit DecryptionRequested(proposalId);
    }

    //  Settle after co-processor has processed the decryption 
    // Reverts with DecryptionNotReady if the co-processor hasn't finished yet.
    // Anyone can call.

    function settle(uint256 proposalId) external {
        Proposal storage p = _proposals[proposalId];
        if (!p.decryptRequested) revert DecryptionNotRequested();
        if (p.settled) revert AlreadySettled();

        (uint128 yesCount, bool ready) = FHE.getDecryptResultSafe(p.yesCount);
        if (!ready) revert DecryptionNotReady();

        p.revealedYes = yesCount;
        p.passed = yesCount >= uint128(p.quorum);
        p.settled = true;

        emit ProposalSettled(proposalId, p.passed, yesCount);
    }

    //  View helpers 

    function getProposal(uint256 proposalId)
        external
        view
        returns (
            address proposer,
            string memory title,
            string memory description,
            uint256 deadline,
            uint256 quorum,
            uint256 totalVoters,
            bool decryptRequested,
            bool settled,
            bool passed,
            uint128 revealedYes
        )
    {
        Proposal storage p = _proposals[proposalId];
        return (
            p.proposer, p.title, p.description, p.deadline,
            p.quorum, p.totalVoters, p.decryptRequested,
            p.settled, p.passed, p.revealedYes
        );
    }
}
