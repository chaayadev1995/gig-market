// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

interface IERC8183 {
    enum JobStatus { OPEN, FUNDED, SUBMITTED, COMPLETED, REJECTED }

    struct Job {
        address client;
        address provider;
        address evaluator;
        address token;
        uint256 amount;
        uint256 expiry;
        JobStatus status;
        bytes32 deliverableHash;
    }

    event JobCreated(uint256 indexed jobId, address indexed client, address indexed provider, address evaluator, address token, uint256 amount, uint256 expiry);
    event JobFunded(uint256 indexed jobId);
    event WorkSubmitted(uint256 indexed jobId, bytes32 deliverableHash);
    event JobCompleted(uint256 indexed jobId);
    event JobRejected(uint256 indexed jobId);
    event JobRefunded(uint256 indexed jobId);

    function createJob(address provider, address evaluator, address token, uint256 amount, uint256 expiry) external returns (uint256 jobId);
    function fundJob(uint256 jobId) external;
    function submitWork(uint256 jobId, bytes32 deliverableHash) external;
    function completeJob(uint256 jobId) external;
    function rejectJob(uint256 jobId) external;
    function getJob(uint256 jobId) external view returns (Job memory);
}

contract AgentEscrow8183 is IERC8183 {
    using ECDSA for bytes32;

    uint256 public jobCount;
    mapping(uint256 => Job) public jobs;
    mapping(uint256 => bytes) public jobCommitmentSignatures;

    error NotClient();
    error NotProvider();
    error NotEvaluator();
    error InvalidStatus();
    error TransferFailed();
    error JobExpired();
    error JobNotExpired();
    error InvalidSignature();

    function createJob(
        address provider,
        address evaluator,
        address token,
        uint256 amount,
        uint256 expiry
    ) external override returns (uint256 jobId) {
        jobCount++;
        jobId = jobCount;

        jobs[jobId] = Job({
            client: msg.sender,
            provider: provider,
            evaluator: evaluator,
            token: token,
            amount: amount,
            expiry: expiry,
            status: JobStatus.OPEN,
            deliverableHash: bytes32(0)
        });

        emit JobCreated(jobId, msg.sender, provider, evaluator, token, amount, expiry);
    }

    function fundJob(uint256 jobId) external override {
        Job storage job = jobs[jobId];
        if (job.status != JobStatus.OPEN) revert InvalidStatus();
        
        job.status = JobStatus.FUNDED;
        emit JobFunded(jobId);

        if (!IERC20(job.token).transferFrom(job.client, address(this), job.amount)) {
            revert TransferFailed();
        }
    }

    // Agent handshakes via signature to commit to the job and stakes 10% collateral
    function commitToJob(uint256 jobId, bytes calldata signature) external {
        Job storage job = jobs[jobId];
        if (job.status != JobStatus.FUNDED) revert InvalidStatus();
        if (msg.sender != job.provider) revert NotProvider();

        // Verify signature: provider must sign the hash of (jobId, provider)
        bytes32 messageHash = keccak256(abi.encodePacked(jobId, msg.sender));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        
        if (ethSignedMessageHash.recover(signature) != msg.sender) {
            revert InvalidSignature();
        }

        jobCommitmentSignatures[jobId] = signature;

        // Stake 10% of budget
        uint256 reqStake = job.amount / 10;
        if (reqStake > 0) {
            if (!IERC20(job.token).transferFrom(msg.sender, address(this), reqStake)) {
                revert TransferFailed();
            }
        }
    }

    function submitWork(uint256 jobId, bytes32 deliverableHash) external override {
        Job storage job = jobs[jobId];
        if (job.status != JobStatus.FUNDED) revert InvalidStatus();
        if (msg.sender != job.provider) revert NotProvider();

        job.status = JobStatus.SUBMITTED;
        job.deliverableHash = deliverableHash;

        emit WorkSubmitted(jobId, deliverableHash);
    }

    function completeJob(uint256 jobId) external override {
        Job storage job = jobs[jobId];
        if (job.status != JobStatus.SUBMITTED && job.status != JobStatus.FUNDED) revert InvalidStatus();
        if (msg.sender != job.evaluator) revert NotEvaluator();

        job.status = JobStatus.COMPLETED;
        emit JobCompleted(jobId);

        // Return budget + provider's 10% collateral
        uint256 payout = job.amount + (job.amount / 10);
        if (!IERC20(job.token).transfer(job.provider, payout)) {
            revert TransferFailed();
        }
    }

    function rejectJob(uint256 jobId) external override {
        Job storage job = jobs[jobId];
        if (job.status != JobStatus.SUBMITTED && job.status != JobStatus.FUNDED) revert InvalidStatus();
        if (msg.sender != job.evaluator) revert NotEvaluator();

        job.status = JobStatus.REJECTED;
        emit JobRejected(jobId);

        // Transfer budget back to client; provider's 10% collateral is slashed and sent to client
        uint256 refund = job.amount + (job.amount / 10);
        if (!IERC20(job.token).transfer(job.client, refund)) {
            revert TransferFailed();
        }
    }

    // Client can refund if job expired without completion
    function refundJob(uint256 jobId) external {
        Job storage job = jobs[jobId];
        if (job.status != JobStatus.FUNDED && job.status != JobStatus.SUBMITTED) revert InvalidStatus();
        if (msg.sender != job.client) revert NotClient();
        if (block.timestamp < job.expiry) revert JobNotExpired();

        job.status = JobStatus.REJECTED;
        emit JobRefunded(jobId);

        // Transfer budget back to client; provider's 10% collateral is slashed and sent to client
        uint256 refund = job.amount + (job.amount / 10);
        if (!IERC20(job.token).transfer(job.client, refund)) {
            revert TransferFailed();
        }
    }

    function getJob(uint256 jobId) external view override returns (Job memory) {
        return jobs[jobId];
    }
}
