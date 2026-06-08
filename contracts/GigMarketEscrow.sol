// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address owner) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
}

interface IStableFXRouter {
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) external returns (uint256 amountOut);
}

interface IUSYC {
    function mint(uint256 usdcAmount) external returns (uint256);
    function redeem(uint256 shareAmount) external returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function getSharePrice() external view returns (uint256);
}

interface IAgentRegistry {
    function isRegisteredAgent(address agentAddress) external view returns (bool);
    function getAgentURI(address agentAddress) external view returns (string memory);
}

interface IArcConfidentialToken {
    function confidentialTransferFrom(
        address from,
        address to,
        bytes32 commitment,
        bytes calldata proof
    ) external returns (bool);

    function confidentialTransfer(
        address to,
        bytes32 commitment,
        bytes calldata proof
    ) external returns (bool);
}

interface IArcPrivacyModule {
    function verifyConfidentialTransaction(
        address token,
        address from,
        address to,
        bytes32 commitment,
        bytes calldata proof
    ) external returns (bool);
}


contract GigMarketEscrow {
    enum JobStatus { Created, Active, Disputed, Resolved, Completed, AppealPending }
    enum VoteOption { None, ClientWins, FreelancerWins, Split }

    error NotOwner();
    error NotJobClient();
    error NotJobFreelancer();
    error NotJuror();
    error NotRegisteredAgent();
    error Unauthorized();
    error InvalidStatus();
    error AlreadyJoined();
    error TransferFailed();

    struct Milestone {
        uint256 budget;       // in USDC (6 decimals)
        string title;
        bool completed;
        bool approved;
    }

    struct Job {
        uint256 id;
        address client;
        address freelancer;
        uint256 budget;       // Total job budget in USDC
        uint256 freelancerStake; // Total freelancer collateral staked
        uint256 requiredStake; // Total required stake based on reputation
        JobStatus status;
        string repoUrl;       // GitHub Repo URL (e.g. owner/repo)
        uint256 creationTime;
        uint256 milestonesCount;
        uint256 currentMilestone;
        uint256 accumulatedYield; // Accrued yield (in USDC, 6 decimals)
        uint256 yieldDistributed; // Distributed yield (in USDC, 6 decimals)
    }

    IERC20 public immutable usdcToken;
    IERC20 public eurcToken;
    address public stableFXRouter;
    address public owner;
    uint256 public jobCount;
    uint256 public platformFeesAccumulated;

    IUSYC public usycToken;
    mapping(uint256 => uint256) public jobUsycShares;

    // Reputation: address => rating score/successful projects
    mapping(address => uint256) public reputation;
    
    // Jobs: jobId => Job
    mapping(uint256 => Job) public jobs;
    
    // Milestones: jobId => milestoneIndex => Milestone
    mapping(uint256 => mapping(uint256 => Milestone)) public jobMilestones;

    // jobId => preferred payout currency ("USDC" or "EURC")
    mapping(uint256 => string) public jobPayoutCurrency;

    // Jurors
    mapping(address => bool) public isJuror;
    address[] public jurorList;
    mapping(address => uint256) public jurorReputation;
    uint256 public constant JUROR_VOTE_STAKE = 50 * 10**6; // 50 USDC
    
    // Disputes: jobId => voter => VoteOption
    mapping(uint256 => mapping(address => VoteOption)) public disputeVotes;
    mapping(uint256 => address[]) public disputeVoters;
    
    // Multi-tier tracking: jobId => tier => voter => VoteOption
    mapping(uint256 => mapping(uint256 => mapping(address => VoteOption))) public tierVotes;
    mapping(uint256 => mapping(uint256 => address[])) public tierVoters;

    struct DisputeState {
        uint256 appealTier;     // 0 = Initial, 1 = Tier 1, 2 = Tier 2 (Final)
        VoteOption ruling;      // Temporary or final ruling
        uint256 resolveTime;    // Time when dispute was temporarily resolved
        bool rulingExecuted;    // Whether settlement has been executed
        uint256 appealDeadline; // Deadline to appeal
        uint256 totalAppealPot; // Total appeal fees accumulated (in USDC)
    }
    mapping(uint256 => DisputeState) public disputeStates;
    
    // Vote counts for disputes: jobId => VoteOption => Count
    mapping(uint256 => mapping(uint8 => uint256)) public disputeVoteCounts;
    mapping(uint256 => bool) public disputeResolved;

    address public treasury;
    mapping(uint256 => address[]) public jobRecipients;
    mapping(uint256 => uint256[]) public jobSplits;
    
    address public agentRegistry;
    mapping(uint256 => bool) public agentOnlyJobs;

    address public constant ARC_PRIVACY_PRECOMPILE = address(0x0000000000000000000000000000000000000180);
    mapping(uint256 => bool) public isPrivateJob;
    mapping(uint256 => bytes32) public jobBudgetCommitment;
    mapping(uint256 => string) public jobEncryptedDetails;

    event JobSplitsUpdated(uint256 indexed jobId, address[] recipients, uint256[] splits);
    event PlatformFeeRouted(uint256 indexed jobId, address indexed treasury, uint256 amount);
    event AgentRegistryUpdated(address indexed registry);
    event JobAgentOnlySet(uint256 indexed jobId, bool agentOnly);

    event JobCreated(uint256 indexed jobId, address indexed client, uint256 budget, string repoUrl);
    event JobJoined(uint256 indexed jobId, address indexed freelancer, uint256 stakedCollateral);
    event MilestoneCompleted(uint256 indexed jobId, uint256 milestoneIndex, uint256 amount);
    event JobDisputed(uint256 indexed jobId, address indexed initiatedBy);
    event DisputeVoted(uint256 indexed jobId, address indexed juror, VoteOption vote);
    event DisputeResolved(uint256 indexed jobId, VoteOption winningOption);
    event JurorRegistered(address indexed juror);
    event PayoutCurrencyUpdated(uint256 indexed jobId, string currency);
    event DisputeAppealed(uint256 indexed jobId, uint256 newTier, address indexed appellant, uint256 appealFee);
    event RulingExecuted(uint256 indexed jobId, VoteOption ruling);
    event FinalAppealResolved(uint256 indexed jobId, VoteOption ruling);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyJobClient(uint256 jobId) {
        if (jobs[jobId].client != msg.sender) revert NotJobClient();
        _;
    }

    modifier onlyJobFreelancer(uint256 jobId) {
        if (jobs[jobId].freelancer != msg.sender) revert NotJobFreelancer();
        _;
    }

    modifier onlyJuror() {
        if (!isJuror[msg.sender]) revert NotJuror();
        _;
    }

    modifier onlyRegisteredAgent(address agent) {
        if (agentRegistry != address(0)) {
            if (!IAgentRegistry(agentRegistry).isRegisteredAgent(agent)) revert NotRegisteredAgent();
        }
        _;
    }

    constructor(address _usdcToken) {
        usdcToken = IERC20(_usdcToken);
        owner = msg.sender;
    }

    function setStableFX(address _router, address _eurcToken) external onlyOwner {
        stableFXRouter = _router;
        eurcToken = IERC20(_eurcToken);
    }

    function setUsycToken(address _usycToken) external onlyOwner {
        usycToken = IUSYC(_usycToken);
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    function setAgentRegistry(address _agentRegistry) external onlyOwner {
        agentRegistry = _agentRegistry;
        emit AgentRegistryUpdated(_agentRegistry);
    }

    function setJobAgentOnly(uint256 jobId, bool agentOnly) external onlyJobClient(jobId) {
        agentOnlyJobs[jobId] = agentOnly;
        emit JobAgentOnlySet(jobId, agentOnly);
    }

    function withdrawFees(address to, uint256 amount) external onlyOwner {
        require(amount <= platformFeesAccumulated, "Insufficient accumulated fees");
        platformFeesAccumulated -= amount;
        require(usdcToken.transfer(to, amount), "Fee transfer failed");
    }

    function setJobSplits(
        uint256 jobId,
        address[] calldata recipients,
        uint256[] calldata splits
    ) public {
        Job storage job = jobs[jobId];
        require(msg.sender == job.client || msg.sender == job.freelancer || msg.sender == owner, "Unauthorized");
        require(job.status == JobStatus.Created || job.status == JobStatus.Active, "Invalid status");
        require(recipients.length == splits.length, "Mismatched arrays");
        require(recipients.length > 0, "Empty list");
        
        uint256 totalSplit = 0;
        for (uint256 i = 0; i < splits.length; i++) {
            require(recipients[i] != address(0), "Invalid address");
            totalSplit += splits[i];
        }
        require(totalSplit == 100, "Split must sum 100");
        
        jobRecipients[jobId] = recipients;
        jobSplits[jobId] = splits;

        emit JobSplitsUpdated(jobId, recipients, splits);
    }

    function getJobSplits(uint256 jobId) external view returns (address[] memory, uint256[] memory) {
        return (jobRecipients[jobId], jobSplits[jobId]);
    }

    function joinJobWithSplits(
        uint256 jobId,
        address[] calldata recipients,
        uint256[] calldata splits
    ) external {
        joinJob(jobId);
        setJobSplits(jobId, recipients, splits);
    }

    function createJobWithSplits(
        uint256 budget,
        string calldata repoUrl,
        uint256[] calldata milestoneBudgets,
        string[] calldata milestoneTitles,
        address[] calldata recipients,
        uint256[] calldata splits
    ) external returns (uint256) {
        uint256 jobId = createJob(budget, repoUrl, milestoneBudgets, milestoneTitles);
        
        require(recipients.length == splits.length, "Mismatched arrays");
        require(recipients.length > 0, "Empty recipients list");
        
        uint256 totalSplit = 0;
        for (uint256 i = 0; i < splits.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient address");
            totalSplit += splits[i];
        }
        require(totalSplit == 100, "Total split must equal 100%");
        
        jobRecipients[jobId] = recipients;
        jobSplits[jobId] = splits;

        emit JobSplitsUpdated(jobId, recipients, splits);
        
        return jobId;
    }

    function calculateAccruedYield(uint256 jobId) public view returns (uint256) {
        if (address(usycToken) == address(0) || jobUsycShares[jobId] == 0) {
            return 0;
        }
        Job memory job = jobs[jobId];
        uint256 remainingPrincipal = 0;
        if (job.status == JobStatus.Active || job.status == JobStatus.Disputed) {
            for (uint256 i = job.currentMilestone; i < job.milestonesCount; i++) {
                remainingPrincipal += jobMilestones[jobId][i].budget;
            }
            remainingPrincipal += job.freelancerStake;
        } else if (job.status == JobStatus.Created) {
            remainingPrincipal = job.budget;
        } else {
            return 0;
        }

        uint256 price = usycToken.getSharePrice();
        uint256 currentValue = (jobUsycShares[jobId] * price) / 1e6;
        if (currentValue > remainingPrincipal) {
            return currentValue - remainingPrincipal;
        }
        return 0;
    }

    function setPayoutCurrency(uint256 jobId, string calldata currency) external onlyJobFreelancer(jobId) {
        require(
            keccak256(abi.encodePacked(currency)) == keccak256(abi.encodePacked("USDC")) ||
            keccak256(abi.encodePacked(currency)) == keccak256(abi.encodePacked("EURC")),
            "Invalid currency"
        );
        jobPayoutCurrency[jobId] = currency;
        emit PayoutCurrencyUpdated(jobId, currency);
    }


    // --- REPUTATION AND STAKE LOGIC (Feature D) ---
    
    function getRequiredStakePercentage(address freelancerAddress) public view returns (uint256) {
        uint256 rep = reputation[freelancerAddress];
        if (rep >= 5) {
            return 0; // 0% stake required for elite freelancers
        } else if (rep >= 3) {
            return 5; // 5% stake for experienced freelancers
        } else {
            return 10; // Default 10% stake
        }
    }

    function calculateRequiredStake(address freelancerAddress, uint256 budget) public view returns (uint256) {
        uint256 pct = getRequiredStakePercentage(freelancerAddress);
        return (budget * pct) / 100;
    }

    // --- JOB CREATION AND EXECUTION (Feature A) ---

    function createJob(
        uint256 budget,
        string calldata repoUrl,
        uint256[] calldata milestoneBudgets,
        string[] calldata milestoneTitles
    ) public returns (uint256) {
        require(budget > 0, "Zero budget");
        require(milestoneBudgets.length == milestoneTitles.length, "Mismatched length");
        
        uint256 totalMilestoneBudget = 0;
        for (uint256 i = 0; i < milestoneBudgets.length; i++) {
            totalMilestoneBudget += milestoneBudgets[i];
        }
        require(totalMilestoneBudget == budget, "Mismatched sum");

        jobCount++;
        uint256 jobId = jobCount;

        jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            freelancer: address(0),
            budget: budget,
            freelancerStake: 0,
            requiredStake: 0,
            status: JobStatus.Created,
            repoUrl: repoUrl,
            creationTime: block.timestamp,
            milestonesCount: milestoneBudgets.length,
            currentMilestone: 0,
            accumulatedYield: 0,
            yieldDistributed: 0
        });

        for (uint256 i = 0; i < milestoneBudgets.length; i++) {
            jobMilestones[jobId][i] = Milestone({
                budget: milestoneBudgets[i],
                title: milestoneTitles[i],
                completed: false,
                approved: false
            });
        }

        // Transfer USDC budget from client to this contract
        require(
            usdcToken.transferFrom(msg.sender, address(this), budget),
            "Funding failed"
        );

        if (address(usycToken) != address(0)) {
            usdcToken.approve(address(usycToken), budget);
            uint256 shares = IUSYC(address(usycToken)).mint(budget);
            jobUsycShares[jobId] = shares;
        }

        emit JobCreated(jobId, msg.sender, budget, repoUrl);
        return jobId;
    }

    function createPrivateJob(
        bytes32 budgetCommitment,
        bytes calldata zkpProof,
        string calldata encryptedDetails,
        uint256 publicBudgetAmount
    ) external returns (uint256) {
        jobCount++;
        uint256 jobId = jobCount;

        isPrivateJob[jobId] = true;
        jobBudgetCommitment[jobId] = budgetCommitment;
        jobEncryptedDetails[jobId] = encryptedDetails;

        jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            freelancer: address(0),
            budget: 0,
            freelancerStake: 0,
            requiredStake: 0,
            status: JobStatus.Created,
            repoUrl: "CONFIDENTIAL",
            creationTime: block.timestamp,
            milestonesCount: 0,
            currentMilestone: 0,
            accumulatedYield: 0,
            yieldDistributed: 0
        });

        if (ARC_PRIVACY_PRECOMPILE.code.length > 0) {
            try IArcPrivacyModule(ARC_PRIVACY_PRECOMPILE).verifyConfidentialTransaction(
                address(usdcToken),
                msg.sender,
                address(this),
                budgetCommitment,
                zkpProof
            ) returns (bool success) {
                require(success, "ZKP verification failed");
            } catch {}
        }

        try IArcConfidentialToken(address(usdcToken)).confidentialTransferFrom(
            msg.sender,
            address(this),
            budgetCommitment,
            zkpProof
        ) returns (bool success) {
            require(success, "Confidential transfer failed");
        } catch {
            require(
                usdcToken.transferFrom(msg.sender, address(this), publicBudgetAmount),
                "Funding failed"
            );
            if (address(usycToken) != address(0)) {
                usdcToken.approve(address(usycToken), publicBudgetAmount);
                uint256 shares = IUSYC(address(usycToken)).mint(publicBudgetAmount);
                jobUsycShares[jobId] = shares;
            }
        }

        emit JobCreated(jobId, msg.sender, 0, "CONFIDENTIAL");
        return jobId;
    }

    function joinPrivateJob(
        uint256 jobId,
        uint256 freelancerStakeAmount,
        bytes32 stakeCommitment,
        bytes calldata zkpProof
    ) external onlyRegisteredAgent(msg.sender) {
        Job storage job = jobs[jobId];
        require(isPrivateJob[jobId], "Not private");
        require(job.status == JobStatus.Created, "Not open");
        require(job.freelancer == address(0), "Joined");
        require(job.client != msg.sender, "Client join forbidden");

        job.freelancer = msg.sender;
        job.requiredStake = freelancerStakeAmount;
        job.freelancerStake = freelancerStakeAmount;
        job.status = JobStatus.Active;

        if (freelancerStakeAmount > 0) {
            try IArcConfidentialToken(address(usdcToken)).confidentialTransferFrom(
                msg.sender,
                address(this),
                stakeCommitment,
                zkpProof
            ) returns (bool success) {
                require(success, "Confidential stake failed");
            } catch {
                require(
                    usdcToken.transferFrom(msg.sender, address(this), freelancerStakeAmount),
                    "Staking failed"
                );
                if (address(usycToken) != address(0)) {
                    usdcToken.approve(address(usycToken), freelancerStakeAmount);
                    uint256 shares = IUSYC(address(usycToken)).mint(freelancerStakeAmount);
                    jobUsycShares[jobId] += shares;
                }
            }
        }

        emit JobJoined(jobId, msg.sender, freelancerStakeAmount);
    }

    function approvePrivateMilestone(
        uint256 jobId,
        uint256 milestoneIndex,
        uint256 payoutAmount,
        bytes32 payoutCommitment,
        bytes calldata zkpProof,
        bool isLastMilestone
    ) external {
        Job storage job = jobs[jobId];
        require(isPrivateJob[jobId], "Not private");
        require(job.status == JobStatus.Active, "Not active");
        require(msg.sender == job.client || msg.sender == owner, "Unauthorized");
        require(milestoneIndex == job.currentMilestone, "Out of order");

        job.currentMilestone++;

        uint256 platformFee = payoutAmount / 100;
        uint256 freelancerPayout = payoutAmount - platformFee;

        uint256 yieldAccrued = 0;
        if (address(usycToken) != address(0) && jobUsycShares[jobId] > 0) {
            uint256 sharesToRedeem = (jobUsycShares[jobId] * payoutAmount) / (payoutAmount * 2);
            if (sharesToRedeem > jobUsycShares[jobId]) {
                sharesToRedeem = jobUsycShares[jobId];
            }
            if (sharesToRedeem > 0) {
                jobUsycShares[jobId] -= sharesToRedeem;
                uint256 balanceBefore = usdcToken.balanceOf(address(this));
                IUSYC(address(usycToken)).redeem(sharesToRedeem);
                uint256 usdcReceived = usdcToken.balanceOf(address(this)) - balanceBefore;
                if (usdcReceived > payoutAmount) {
                    yieldAccrued = usdcReceived - payoutAmount;
                }
            }
        }

        uint256 freelancerYield = 0;
        uint256 clientYield = 0;
        uint256 platformYield = 0;
        
        if (yieldAccrued > 0) {
            freelancerYield = (yieldAccrued * 50) / 100;
            clientYield = (yieldAccrued * 30) / 100;
            platformYield = yieldAccrued - freelancerYield - clientYield;
            
            if (treasury != address(0) && platformYield > 0) {
                require(usdcToken.transfer(treasury, platformYield), "Yield failed");
                emit PlatformFeeRouted(jobId, treasury, platformYield);
            } else {
                platformFeesAccumulated += platformYield;
            }
            
            job.accumulatedYield += yieldAccrued;
            job.yieldDistributed += yieldAccrued;
            
            if (clientYield > 0) {
                require(usdcToken.transfer(job.client, clientYield), "Yield failed");
            }
        }

        if (platformFee > 0) {
            if (treasury != address(0)) {
                require(usdcToken.transfer(treasury, platformFee), "Fee failed");
                emit PlatformFeeRouted(jobId, treasury, platformFee);
            } else {
                platformFeesAccumulated += platformFee;
            }
        }

        uint256 totalPayout = freelancerPayout + freelancerYield;
        try IArcConfidentialToken(address(usdcToken)).confidentialTransfer(
            job.freelancer,
            payoutCommitment,
            zkpProof
        ) returns (bool success) {
            require(success, "Confidential payout failed");
        } catch {
            require(usdcToken.transfer(job.freelancer, totalPayout), "Payout failed");
        }

        if (isLastMilestone) {
            job.status = JobStatus.Completed;
            reputation[job.freelancer] += 1;
        }

        emit MilestoneCompleted(jobId, milestoneIndex, payoutAmount);
    }

    function joinJob(uint256 jobId) public onlyRegisteredAgent(msg.sender) {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Created, "Not open");
        require(job.freelancer == address(0), "Joined");
        require(job.client != msg.sender, "Client join forbidden");

        uint256 reqStake = calculateRequiredStake(msg.sender, job.budget);

        job.freelancer = msg.sender;
        job.requiredStake = reqStake;
        job.freelancerStake = reqStake;
        job.status = JobStatus.Active;

        if (reqStake > 0) {
            require(
                usdcToken.transferFrom(msg.sender, address(this), reqStake),
                "Collateral staking failed"
            );
            if (address(usycToken) != address(0)) {
                usdcToken.approve(address(usycToken), reqStake);
                uint256 shares = IUSYC(address(usycToken)).mint(reqStake);
                jobUsycShares[jobId] += shares;
            }
        }

        emit JobJoined(jobId, msg.sender, reqStake);
    }

    // --- MILESTONE SETTLEMENT (Feature B) ---

    // Either the Client directly approves, or the automated system (GitHub trigger) calls this
    function approveMilestone(uint256 jobId, uint256 milestoneIndex) external {
        approveMilestoneWithSlippage(jobId, milestoneIndex, 0);
    }

    function approveMilestoneWithSlippage(uint256 jobId, uint256 milestoneIndex, uint256 minAmountEURC) public {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Active, "Not active");
        
        // Automated script (owned by owner/backend) or Client can approve
        require(
            msg.sender == job.client || msg.sender == owner,
            "Unauthorized"
        );
        
        Milestone storage milestone = jobMilestones[jobId][milestoneIndex];
        require(!milestone.approved, "Approved");
        require(milestoneIndex == job.currentMilestone, "Out of order");

        milestone.approved = true;
        milestone.completed = true;

        // Disburse milestone payout
        uint256 payout = milestone.budget;
        
        // 1. Calculate 1% Platform Take Rate fee
        uint256 platformFee = payout / 100;
        uint256 freelancerPayout = payout - platformFee;

        // 2. Proportional Freelancer Stake return
        uint256 stakeReturn = 0;
        if (job.requiredStake > 0) {
            stakeReturn = (job.requiredStake * milestone.budget) / job.budget;
            if (stakeReturn > job.freelancerStake) {
                stakeReturn = job.freelancerStake;
            }
            job.freelancerStake -= stakeReturn;
        }

        job.currentMilestone++;
        
        // Payout: Milestone budget + Staked Collateral return (principal)
        uint256 totalPayoutUSDC = payout + stakeReturn;

        // Redeem from USYC if configured
        uint256 usdcReceived = totalPayoutUSDC;
        uint256 yieldAccrued = 0;
        
        if (address(usycToken) != address(0) && jobUsycShares[jobId] > 0) {
            uint256 totalJobFunding = job.budget + job.requiredStake;
            uint256 sharesToRedeem;
            if (job.currentMilestone == job.milestonesCount) {
                sharesToRedeem = jobUsycShares[jobId];
            } else {
                sharesToRedeem = (jobUsycShares[jobId] * totalPayoutUSDC) / totalJobFunding;
            }
            
            if (sharesToRedeem > 0) {
                if (sharesToRedeem > jobUsycShares[jobId]) {
                    sharesToRedeem = jobUsycShares[jobId];
                }
                jobUsycShares[jobId] -= sharesToRedeem;
                
                uint256 balanceBefore = usdcToken.balanceOf(address(this));
                IUSYC(address(usycToken)).redeem(sharesToRedeem);
                usdcReceived = usdcToken.balanceOf(address(this)) - balanceBefore;
                
                if (usdcReceived > totalPayoutUSDC) {
                    yieldAccrued = usdcReceived - totalPayoutUSDC;
                }
            }
        }

        uint256 freelancerYield = 0;
        uint256 clientYield = 0;
        uint256 platformYield = 0;
        
        if (yieldAccrued > 0) {
            freelancerYield = (yieldAccrued * 50) / 100;
            clientYield = (yieldAccrued * 30) / 100;
            platformYield = yieldAccrued - freelancerYield - clientYield;
            
            if (treasury != address(0) && platformYield > 0) {
                require(usdcToken.transfer(treasury, platformYield), "Yield failed");
                emit PlatformFeeRouted(jobId, treasury, platformYield);
            } else {
                platformFeesAccumulated += platformYield;
            }
            
            job.accumulatedYield += yieldAccrued;
            job.yieldDistributed += yieldAccrued;
            
            if (clientYield > 0) {
                require(usdcToken.transfer(job.client, clientYield), "Yield failed");
            }
        }

        if (job.currentMilestone == job.milestonesCount) {
            job.status = JobStatus.Completed;
            // Reward freelancer reputation
            reputation[job.freelancer] += 1;
        }

        // Payout platform fee to treasury
        if (platformFee > 0) {
            if (treasury != address(0)) {
                require(usdcToken.transfer(treasury, platformFee), "Fee failed");
                emit PlatformFeeRouted(jobId, treasury, platformFee);
            } else {
                platformFeesAccumulated += platformFee;
            }
        }

        // Payout: split among recipients if configured, otherwise pay single freelancer
        uint256 totalFreelancerPayout = totalPayoutUSDC - platformFee + freelancerYield;

        uint256 recipientsCount = jobRecipients[jobId].length;
        if (recipientsCount == 0) {
            if (keccak256(abi.encodePacked(jobPayoutCurrency[jobId])) == keccak256(abi.encodePacked("EURC")) && stableFXRouter != address(0)) {
                // Approve router to spend USDC
                usdcToken.approve(stableFXRouter, totalFreelancerPayout);
                
                // Execute swap via stableFXRouter
                uint256 amountOut = IStableFXRouter(stableFXRouter).swap(
                    address(usdcToken),
                    address(eurcToken),
                    totalFreelancerPayout,
                    minAmountEURC,
                    job.freelancer
                );
                
                require(amountOut >= minAmountEURC, "Slippage");
            } else {
                // Transfer USDC directly
                require(
                    usdcToken.transfer(job.freelancer, totalFreelancerPayout),
                    "Payout failed"
                );
            }
        } else {
            // Multi-party split payout
            // First, return the stake to the lead freelancer if any
            if (stakeReturn > 0) {
                require(usdcToken.transfer(job.freelancer, stakeReturn), "Stake failed");
            }
            
            // Now split freelancerPayout and freelancerYield among recipients
            uint256 totalDistributedPayout = 0;
            uint256 totalDistributedYield = 0;
            
            for (uint256 i = 0; i < recipientsCount; i++) {
                address recipient = jobRecipients[jobId][i];
                uint256 splitPct = jobSplits[jobId][i];
                
                uint256 payoutShare;
                uint256 yieldShare;
                
                if (i == recipientsCount - 1) {
                    // Prevent dust loss by assigning the remainder to the last recipient
                    payoutShare = freelancerPayout - totalDistributedPayout;
                    yieldShare = freelancerYield - totalDistributedYield;
                } else {
                    payoutShare = (freelancerPayout * splitPct) / 100;
                    yieldShare = (freelancerYield * splitPct) / 100;
                }
                
                totalDistributedPayout += payoutShare;
                totalDistributedYield += yieldShare;
                
                uint256 totalRecipientPayout = payoutShare + yieldShare;
                if (totalRecipientPayout > 0) {
                    if (keccak256(abi.encodePacked(jobPayoutCurrency[jobId])) == keccak256(abi.encodePacked("EURC")) && stableFXRouter != address(0)) {
                        usdcToken.approve(stableFXRouter, totalRecipientPayout);
                        IStableFXRouter(stableFXRouter).swap(
                            address(usdcToken),
                            address(eurcToken),
                            totalRecipientPayout,
                            0,
                            recipient
                        );
                    } else {
                        require(usdcToken.transfer(recipient, totalRecipientPayout), "Recipient payout failed");
                    }
                }
            }
        }

        emit MilestoneCompleted(jobId, milestoneIndex, payout);
    }

    // --- DISPUTE RESOLUTION (Feature C) ---

    function initiateDispute(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Active, "Job not active");
        require(
            msg.sender == job.client || msg.sender == job.freelancer,
            "Not authorized"
        );

        job.status = JobStatus.Disputed;
        emit JobDisputed(jobId, msg.sender);
    }

    function registerAsJuror() external {
        require(!isJuror[msg.sender], "Juror exists");
        isJuror[msg.sender] = true;
        jurorReputation[msg.sender] = 100; // Starting baseline reputation
        jurorList.push(msg.sender);
        emit JurorRegistered(msg.sender);
    }

    function voteOnDispute(uint256 jobId, VoteOption vote) external onlyJuror {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Disputed, "Not disputed");
        require(vote == VoteOption.ClientWins || vote == VoteOption.FreelancerWins || vote == VoteOption.Split, "Bad option");
        require(disputeVotes[jobId][msg.sender] == VoteOption.None, "Voted");
        require(jurorReputation[msg.sender] >= 40, "Juror suspended");

        // Juror must stake 50 USDC to vote
        require(usdcToken.transferFrom(msg.sender, address(this), JUROR_VOTE_STAKE), "Juror stake transfer failed");

        // Wrap the juror's stake in USYC if applicable
        if (address(usycToken) != address(0)) {
            usdcToken.approve(address(usycToken), JUROR_VOTE_STAKE);
            uint256 shares = IUSYC(address(usycToken)).mint(JUROR_VOTE_STAKE);
            jobUsycShares[jobId] += shares;
        }

        disputeVotes[jobId][msg.sender] = vote;
        disputeVoters[jobId].push(msg.sender);
        disputeVoteCounts[jobId][uint8(vote)]++;

        // Track multi-tier votes
        DisputeState storage ds = disputeStates[jobId];
        uint256 currentTier = ds.appealTier;
        tierVotes[jobId][currentTier][msg.sender] = vote;
        tierVoters[jobId][currentTier].push(msg.sender);

        emit DisputeVoted(jobId, msg.sender, vote);
    }

    function resolveDispute(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Disputed, "Not disputed");
        
        DisputeState storage ds = disputeStates[jobId];
        uint256 totalVotes = disputeVoters[jobId].length;
        
        if (ds.appealTier == 0) {
            require(totalVotes >= 1, "Need at least 1 vote for Tier 0");
        } else if (ds.appealTier == 1) {
            require(totalVotes >= 3, "Need at least 3 votes for Tier 1");
        } else {
            revert("Tier 2 resolved by owner");
        }

        uint256 clientWins = disputeVoteCounts[jobId][uint8(VoteOption.ClientWins)];
        uint256 freelancerWins = disputeVoteCounts[jobId][uint8(VoteOption.FreelancerWins)];
        uint256 splitWins = disputeVoteCounts[jobId][uint8(VoteOption.Split)];

        VoteOption winner;
        if (clientWins >= freelancerWins && clientWins >= splitWins) {
            winner = VoteOption.ClientWins;
        } else if (freelancerWins >= clientWins && freelancerWins >= splitWins) {
            winner = VoteOption.FreelancerWins;
        } else {
            winner = VoteOption.Split;
        }

        ds.ruling = winner;
        ds.resolveTime = block.timestamp;
        ds.appealDeadline = block.timestamp + 1 hours; // 1-hour appeal challenge window
        
        job.status = JobStatus.AppealPending;

        emit DisputeResolved(jobId, winner);
    }

    function appealDispute(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.AppealPending, "Not in appeal pending state");
        
        DisputeState storage ds = disputeStates[jobId];
        require(block.timestamp <= ds.appealDeadline, "Appeal window expired");
        require(msg.sender == job.client || msg.sender == job.freelancer, "Unauthorized");

        uint256 currentTier = ds.appealTier;
        require(currentTier < 2, "Cannot appeal final tier");

        // Appeal fee: Tier 1 appeal costs 100 USDC, Tier 2 costs 200 USDC
        uint256 appealFee = currentTier == 0 ? 100 * 10**6 : 200 * 10**6;
        
        require(usdcToken.transferFrom(msg.sender, address(this), appealFee), "Appeal fee transfer failed");
        
        if (address(usycToken) != address(0)) {
            usdcToken.approve(address(usycToken), appealFee);
            uint256 shares = IUSYC(address(usycToken)).mint(appealFee);
            jobUsycShares[jobId] += shares;
        }

        ds.totalAppealPot += appealFee;
        ds.appealTier++;
        
        // Reset voting details for next tier
        uint256 totalVoters = disputeVoters[jobId].length;
        for (uint256 i = 0; i < totalVoters; i++) {
            address voter = disputeVoters[jobId][i];
            disputeVotes[jobId][voter] = VoteOption.None;
        }
        delete disputeVoters[jobId];
        
        disputeVoteCounts[jobId][uint8(VoteOption.ClientWins)] = 0;
        disputeVoteCounts[jobId][uint8(VoteOption.FreelancerWins)] = 0;
        disputeVoteCounts[jobId][uint8(VoteOption.Split)] = 0;

        job.status = JobStatus.Disputed;

        emit DisputeAppealed(jobId, ds.appealTier, msg.sender, appealFee);
    }

    function executeRuling(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.AppealPending, "Not in appeal pending state");
        
        DisputeState storage ds = disputeStates[jobId];
        require(block.timestamp > ds.appealDeadline, "Appeal window active");
        require(!ds.rulingExecuted, "Ruling already executed");

        ds.rulingExecuted = true;
        job.status = JobStatus.Resolved;

        _executeSettlement(jobId, ds.ruling);
        emit RulingExecuted(jobId, ds.ruling);
    }

    function resolveFinalAppeal(uint256 jobId, VoteOption ruling) external onlyOwner {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.AppealPending, "Not in appeal pending state");
        
        DisputeState storage ds = disputeStates[jobId];
        require(ds.appealTier == 2, "Not final appeal tier");
        require(!ds.rulingExecuted, "Ruling already executed");
        require(ruling == VoteOption.ClientWins || ruling == VoteOption.FreelancerWins || ruling == VoteOption.Split, "Bad ruling");

        ds.ruling = ruling;
        ds.rulingExecuted = true;
        job.status = JobStatus.Resolved;

        _executeSettlement(jobId, ruling);
        emit FinalAppealResolved(jobId, ruling);
    }

    function _executeSettlement(uint256 jobId, VoteOption finalRuling) internal {
        Job storage job = jobs[jobId];
        DisputeState storage ds = disputeStates[jobId];

        // Calculate remaining funds in escrow for this job
        uint256 remainingBudget = 0;
        for (uint256 i = job.currentMilestone; i < job.milestonesCount; i++) {
            remainingBudget += jobMilestones[jobId][i].budget;
        }
        
        uint256 freelancerStake = job.freelancerStake;
        uint256 totalEscrowed = remainingBudget + freelancerStake;

        // Total funds locked in contract for this dispute
        uint256 totalLockedFunds = totalEscrowed + ds.totalAppealPot;
        uint256 totalJurorStakes = 0;
        for (uint256 t = 0; t <= ds.appealTier; t++) {
            totalJurorStakes += tierVoters[jobId][t].length * JUROR_VOTE_STAKE;
        }

        uint256 totalRequiredRedemption = totalLockedFunds + totalJurorStakes;

        // Redeem all USYC shares
        uint256 usdcReceived = totalRequiredRedemption;
        uint256 yieldAccrued = 0;
        
        if (address(usycToken) != address(0) && jobUsycShares[jobId] > 0) {
            uint256 sharesToRedeem = jobUsycShares[jobId];
            jobUsycShares[jobId] = 0;
            
            uint256 balanceBefore = usdcToken.balanceOf(address(this));
            IUSYC(address(usycToken)).redeem(sharesToRedeem);
            usdcReceived = usdcToken.balanceOf(address(this)) - balanceBefore;
            
            if (usdcReceived > totalRequiredRedemption) {
                yieldAccrued = usdcReceived - totalRequiredRedemption;
            }
        }

        // Distribute yield (if any)
        uint256 freelancerYield = 0;
        uint256 clientYield = 0;
        uint256 platformYield = 0;
        
        if (yieldAccrued > 0) {
            freelancerYield = (yieldAccrued * 50) / 100;
            clientYield = (yieldAccrued * 30) / 100;
            platformYield = yieldAccrued - freelancerYield - clientYield;
            
            if (treasury != address(0) && platformYield > 0) {
                require(usdcToken.transfer(treasury, platformYield), "Platform yield transfer failed");
                emit PlatformFeeRouted(jobId, treasury, platformYield);
            } else {
                platformFeesAccumulated += platformYield;
            }
            
            job.accumulatedYield += yieldAccrued;
            job.yieldDistributed += yieldAccrued;
            
            if (clientYield > 0) {
                require(usdcToken.transfer(job.client, clientYield), "Client yield transfer failed");
            }
            if (freelancerYield > 0) {
                uint256 recipientsCount = jobRecipients[jobId].length;
                if (recipientsCount == 0) {
                    require(usdcToken.transfer(job.freelancer, freelancerYield), "Freelancer yield transfer failed");
                } else {
                    uint256 totalDistributed = 0;
                    for (uint256 i = 0; i < recipientsCount; i++) {
                        address recipient = jobRecipients[jobId][i];
                        uint256 splitPct = jobSplits[jobId][i];
                        uint256 share;
                        if (i == recipientsCount - 1) {
                            share = freelancerYield - totalDistributed;
                        } else {
                            share = (freelancerYield * splitPct) / 100;
                        }
                        totalDistributed += share;
                        if (share > 0) {
                            require(usdcToken.transfer(recipient, share), "Recipient yield split failed");
                        }
                    }
                }
            }
        }

        // Arbitration fee: 3% of the escrowed funds
        uint256 arbitrationFee = (totalEscrowed * 3) / 100;
        uint256 netEscrowed = totalEscrowed - arbitrationFee;

        // Juror incentive: 2% of total distributed to jurors, 1% to platform
        uint256 jurorRewardPool = (totalEscrowed * 2) / 100;
        uint256 platformShare = arbitrationFee - jurorRewardPool;
        
        if (treasury != address(0) && platformShare > 0) {
            require(usdcToken.transfer(treasury, platformShare), "Platform fee transfer failed");
            emit PlatformFeeRouted(jobId, treasury, platformShare);
        } else {
            platformFeesAccumulated += platformShare;
        }

        // Juror Slashing and Reputation Cascades
        uint256 totalMajorityJurors = 0;
        for (uint256 t = 0; t <= ds.appealTier; t++) {
            uint256 votersInTier = tierVoters[jobId][t].length;
            for (uint256 i = 0; i < votersInTier; i++) {
                address voter = tierVoters[jobId][t][i];
                if (tierVotes[jobId][t][voter] == finalRuling) {
                    totalMajorityJurors++;
                }
            }
        }

        for (uint256 t = 0; t <= ds.appealTier; t++) {
            uint256 votersCount = tierVoters[jobId][t].length;
            if (votersCount == 0) continue;

            uint256 majorityCount = 0;
            uint256 minorityCount = 0;
            for (uint256 i = 0; i < votersCount; i++) {
                address voter = tierVoters[jobId][t][i];
                if (tierVotes[jobId][t][voter] == finalRuling) {
                    majorityCount++;
                } else {
                    minorityCount++;
                }
            }

            uint256 slashedPool = minorityCount * JUROR_VOTE_STAKE;

            for (uint256 i = 0; i < votersCount; i++) {
                address juror = tierVoters[jobId][t][i];
                VoteOption jurorVote = tierVotes[jobId][t][juror];

                if (jurorVote == finalRuling) {
                    uint256 rewardShare = 0;
                    if (majorityCount > 0) {
                        rewardShare += slashedPool / majorityCount;
                    }
                    if (totalMajorityJurors > 0) {
                        rewardShare += jurorRewardPool / totalMajorityJurors;
                    }
                    
                    uint256 totalPayout = JUROR_VOTE_STAKE + rewardShare;
                    require(usdcToken.transfer(juror, totalPayout), "Juror payout failed");
                    jurorReputation[juror] += 10;
                } else {
                    if (jurorReputation[juror] >= 20) {
                        jurorReputation[juror] -= 20;
                    } else {
                        jurorReputation[juror] = 0;
                    }
                    if (jurorReputation[juror] < 40) {
                        isJuror[juror] = false;
                    }
                }
            }
        }

        // Final settlement of Escrow and Appeal Pot
        uint256 finalDistributionAmount = netEscrowed + ds.totalAppealPot;

        if (finalRuling == VoteOption.ClientWins) {
            require(usdcToken.transfer(job.client, finalDistributionAmount), "Client transfer failed");
            if (reputation[job.freelancer] >= 2) {
                reputation[job.freelancer] -= 2;
            } else {
                reputation[job.freelancer] = 0;
            }
        } 
        else if (finalRuling == VoteOption.FreelancerWins) {
            uint256 recipientsCount = jobRecipients[jobId].length;
            if (recipientsCount == 0) {
                require(usdcToken.transfer(job.freelancer, finalDistributionAmount), "Freelancer transfer failed");
            } else {
                uint256 totalDistributed = 0;
                for (uint256 i = 0; i < recipientsCount; i++) {
                    address recipient = jobRecipients[jobId][i];
                    uint256 splitPct = jobSplits[jobId][i];
                    uint256 share;
                    if (i == recipientsCount - 1) {
                        share = finalDistributionAmount - totalDistributed;
                    } else {
                        share = (finalDistributionAmount * splitPct) / 100;
                    }
                    totalDistributed += share;
                    if (share > 0) {
                        require(usdcToken.transfer(recipient, share), "Recipient transfer failed");
                    }
                }
            }
            reputation[job.freelancer] += 1;
        } 
        else {
            uint256 splitAmt = finalDistributionAmount / 2;
            uint256 freelancerAmt = finalDistributionAmount - splitAmt;
            require(usdcToken.transfer(job.client, splitAmt), "Client split failed");
            
            uint256 recipientsCount = jobRecipients[jobId].length;
            if (recipientsCount == 0) {
                require(usdcToken.transfer(job.freelancer, freelancerAmt), "Freelancer split failed");
            } else {
                uint256 totalDistributed = 0;
                for (uint256 i = 0; i < recipientsCount; i++) {
                    address recipient = jobRecipients[jobId][i];
                    uint256 splitPct = jobSplits[jobId][i];
                    uint256 share;
                    if (i == recipientsCount - 1) {
                        share = freelancerAmt - totalDistributed;
                    } else {
                        share = (freelancerAmt * splitPct) / 100;
                    }
                    totalDistributed += share;
                    if (share > 0) {
                        require(usdcToken.transfer(recipient, share), "Recipient split failed");
                    }
                }
            }
        }
    }
}
