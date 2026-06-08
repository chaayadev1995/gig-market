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

contract MockUSYC {
    IERC20 public immutable usdcToken;
    uint256 public deployTime;
    uint256 public constant YIELD_RATE_PER_SECOND = 10; // simulates yield in 6 decimals per second

    string public name = "USD Yield Coin";
    string public symbol = "USYC";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(address _usdcToken) {
        usdcToken = IERC20(_usdcToken);
        deployTime = block.timestamp;
    }

    function getSharePrice() public view returns (uint256) {
        uint256 elapsed = block.timestamp - deployTime;
        // Simulates rate growing by 10 units of 6 decimals per second (~5% APY simulated)
        return 1e6 + (elapsed * YIELD_RATE_PER_SECOND);
    }

    function mint(uint256 usdcAmount) external returns (uint256) {
        require(usdcAmount > 0, "Amount must be > 0");
        uint256 price = getSharePrice();
        uint256 shares = (usdcAmount * 1e6) / price;
        
        require(usdcToken.transferFrom(msg.sender, address(this), usdcAmount), "Transfer failed");
        
        balanceOf[msg.sender] += shares;
        totalSupply += shares;
        return shares;
    }

    function redeem(uint256 shareAmount) external returns (uint256) {
        require(shareAmount > 0, "Shares must be > 0");
        require(balanceOf[msg.sender] >= shareAmount, "Insufficient shares");
        
        uint256 price = getSharePrice();
        uint256 usdcAmount = (shareAmount * price) / 1e6;
        
        balanceOf[msg.sender] -= shareAmount;
        totalSupply -= shareAmount;
        
        require(usdcToken.transfer(msg.sender, usdcAmount), "Transfer failed");
        return usdcAmount;
    }
}

contract GigMarketEscrow {
    enum JobStatus { Created, Active, Disputed, Resolved, Completed }
    enum VoteOption { None, ClientWins, FreelancerWins, Split }

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
    
    // Disputes: jobId => voter => VoteOption
    mapping(uint256 => mapping(address => VoteOption)) public disputeVotes;
    mapping(uint256 => address[]) public disputeVoters;
    
    // Vote counts for disputes: jobId => VoteOption => Count
    mapping(uint256 => mapping(uint8 => uint256)) public disputeVoteCounts;
    mapping(uint256 => bool) public disputeResolved;

    address public treasury;
    mapping(uint256 => address[]) public jobRecipients;
    mapping(uint256 => uint256[]) public jobSplits;

    event JobSplitsUpdated(uint256 indexed jobId, address[] recipients, uint256[] splits);
    event PlatformFeeRouted(uint256 indexed jobId, address indexed treasury, uint256 amount);

    event JobCreated(uint256 indexed jobId, address indexed client, uint256 budget, string repoUrl);
    event JobJoined(uint256 indexed jobId, address indexed freelancer, uint256 stakedCollateral);
    event MilestoneCompleted(uint256 indexed jobId, uint256 milestoneIndex, uint256 amount);
    event JobDisputed(uint256 indexed jobId, address indexed initiatedBy);
    event DisputeVoted(uint256 indexed jobId, address indexed juror, VoteOption vote);
    event DisputeResolved(uint256 indexed jobId, VoteOption winningOption);
    event JurorRegistered(address indexed juror);
    event PayoutCurrencyUpdated(uint256 indexed jobId, string currency);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyJobClient(uint256 jobId) {
        require(jobs[jobId].client == msg.sender, "Not job client");
        _;
    }

    modifier onlyJobFreelancer(uint256 jobId) {
        require(jobs[jobId].freelancer == msg.sender, "Not job freelancer");
        _;
    }

    modifier onlyJuror() {
        require(isJuror[msg.sender], "Not a registered juror");
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
        require(msg.sender == job.client || msg.sender == job.freelancer || msg.sender == owner, "Unauthorized to set splits");
        require(job.status == JobStatus.Created || job.status == JobStatus.Active, "Invalid job status for splits");
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
        require(budget > 0, "Budget must be > 0");
        require(milestoneBudgets.length == milestoneTitles.length, "Mismatched milestones");
        
        uint256 totalMilestoneBudget = 0;
        for (uint256 i = 0; i < milestoneBudgets.length; i++) {
            totalMilestoneBudget += milestoneBudgets[i];
        }
        require(totalMilestoneBudget == budget, "Milestones sum must equal total budget");

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
            "USDC funding failed"
        );

        if (address(usycToken) != address(0)) {
            usdcToken.approve(address(usycToken), budget);
            uint256 shares = IUSYC(address(usycToken)).mint(budget);
            jobUsycShares[jobId] = shares;
        }

        emit JobCreated(jobId, msg.sender, budget, repoUrl);
        return jobId;
    }

    function joinJob(uint256 jobId) public {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Created, "Job not open");
        require(job.freelancer == address(0), "Job already joined");
        require(job.client != msg.sender, "Client cannot be freelancer");

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
        require(job.status == JobStatus.Active, "Job not active");
        
        // Automated script (owned by owner/backend) or Client can approve
        require(
            msg.sender == job.client || msg.sender == owner,
            "Unauthorized approval"
        );
        
        Milestone storage milestone = jobMilestones[jobId][milestoneIndex];
        require(!milestone.approved, "Already approved");
        require(milestoneIndex == job.currentMilestone, "Milestones must be completed in order");

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
        }

        if (job.currentMilestone == job.milestonesCount) {
            job.status = JobStatus.Completed;
            // Reward freelancer reputation
            reputation[job.freelancer] += 1;
        }

        // Payout platform fee to treasury
        if (platformFee > 0) {
            if (treasury != address(0)) {
                require(usdcToken.transfer(treasury, platformFee), "Platform fee transfer failed");
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
                
                require(amountOut >= minAmountEURC, "Slippage limit exceeded");
            } else {
                // Transfer USDC directly
                require(
                    usdcToken.transfer(job.freelancer, totalFreelancerPayout),
                    "Payout transfer failed"
                );
            }
        } else {
            // Multi-party split payout
            // First, return the stake to the lead freelancer if any
            if (stakeReturn > 0) {
                require(usdcToken.transfer(job.freelancer, stakeReturn), "Stake return failed");
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
        require(!isJuror[msg.sender], "Already a juror");
        isJuror[msg.sender] = true;
        jurorList.push(msg.sender);
        emit JurorRegistered(msg.sender);
    }

    function voteOnDispute(uint256 jobId, VoteOption vote) external onlyJuror {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Disputed, "Job not disputed");
        require(vote == VoteOption.ClientWins || vote == VoteOption.FreelancerWins || vote == VoteOption.Split, "Invalid vote option");
        require(disputeVotes[jobId][msg.sender] == VoteOption.None, "Already voted");

        disputeVotes[jobId][msg.sender] = vote;
        disputeVoters[jobId].push(msg.sender);
        disputeVoteCounts[jobId][uint8(vote)]++;

        emit DisputeVoted(jobId, msg.sender, vote);
    }

    function getDisputeVotesInfo(uint256 jobId) external view returns (
        uint256 clientVotes,
        uint256 freelancerVotes,
        uint256 splitVotes,
        uint256 totalVoters
    ) {
        return (
            disputeVoteCounts[jobId][uint8(VoteOption.ClientWins)],
            disputeVoteCounts[jobId][uint8(VoteOption.FreelancerWins)],
            disputeVoteCounts[jobId][uint8(VoteOption.Split)],
            disputeVoters[jobId].length
        );
    }

    function resolveDispute(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Disputed, "Job not disputed");
        
        uint256 totalVotes = disputeVoters[jobId].length;
        require(totalVotes >= 1, "Need at least 1 vote to resolve"); // For testing, keep threshold low

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

        // Calculate remaining funds in escrow for this job
        // Unapproved milestone funds remain in contract
        uint256 remainingBudget = 0;
        for (uint256 i = job.currentMilestone; i < job.milestonesCount; i++) {
            remainingBudget += jobMilestones[jobId][i].budget;
        }
        
        uint256 freelancerStake = job.freelancerStake;
        uint256 totalEscrowed = remainingBudget + freelancerStake;

        // Redeem all remaining USYC shares
        uint256 usdcReceived = totalEscrowed;
        uint256 yieldAccrued = 0;
        
        if (address(usycToken) != address(0) && jobUsycShares[jobId] > 0) {
            uint256 sharesToRedeem = jobUsycShares[jobId];
            jobUsycShares[jobId] = 0;
            
            uint256 balanceBefore = usdcToken.balanceOf(address(this));
            IUSYC(address(usycToken)).redeem(sharesToRedeem);
            usdcReceived = usdcToken.balanceOf(address(this)) - balanceBefore;
            
            if (usdcReceived > totalEscrowed) {
                yieldAccrued = usdcReceived - totalEscrowed;
            }
        }

        // Distribute yield
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

        // Distribute rewards to jurors
        if (totalVotes > 0 && jurorRewardPool > 0) {
            uint256 rewardPerJuror = jurorRewardPool / totalVotes;
            for (uint256 i = 0; i < totalVotes; i++) {
                address juror = disputeVoters[jobId][i];
                usdcToken.transfer(juror, rewardPerJuror);
            }
        }

        job.status = JobStatus.Resolved;

        if (winner == VoteOption.ClientWins) {
            // Client wins: return remaining budget + slashed freelancer stake to client
            require(usdcToken.transfer(job.client, netEscrowed), "Client transfer failed");
            // Decrease freelancer reputation
            if (reputation[job.freelancer] >= 2) {
                reputation[job.freelancer] -= 2;
            } else {
                reputation[job.freelancer] = 0;
            }
        } 
        else if (winner == VoteOption.FreelancerWins) {
            // Freelancer wins: payout remaining budget + return freelancer stake to freelancer
            uint256 recipientsCount = jobRecipients[jobId].length;
            if (recipientsCount == 0) {
                require(usdcToken.transfer(job.freelancer, netEscrowed), "Freelancer transfer failed");
            } else {
                uint256 totalDistributed = 0;
                for (uint256 i = 0; i < recipientsCount; i++) {
                    address recipient = jobRecipients[jobId][i];
                    uint256 splitPct = jobSplits[jobId][i];
                    uint256 share;
                    if (i == recipientsCount - 1) {
                        share = netEscrowed - totalDistributed;
                    } else {
                        share = (netEscrowed * splitPct) / 100;
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
            // Split: split netEscrowed 50/50
            uint256 splitAmt = netEscrowed / 2;
            uint256 freelancerAmt = netEscrowed - splitAmt;
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

        emit DisputeResolved(jobId, winner);
    }
}
