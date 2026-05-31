// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address owner) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
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
    }

    IERC20 public immutable usdcToken;
    address public owner;
    uint256 public jobCount;
    uint256 public platformFeesAccumulated;

    // Reputation: address => rating score/successful projects
    mapping(address => uint256) public reputation;
    
    // Jobs: jobId => Job
    mapping(uint256 => Job) public jobs;
    
    // Milestones: jobId => milestoneIndex => Milestone
    mapping(uint256 => mapping(uint256 => Milestone)) public jobMilestones;

    // Jurors
    mapping(address => bool) public isJuror;
    address[] public jurorList;
    
    // Disputes: jobId => voter => VoteOption
    mapping(uint256 => mapping(address => VoteOption)) public disputeVotes;
    mapping(uint256 => address[]) public disputeVoters;
    
    // Vote counts for disputes: jobId => VoteOption => Count
    mapping(uint256 => mapping(uint8 => uint256)) public disputeVoteCounts;
    mapping(uint256 => bool) public disputeResolved;

    event JobCreated(uint256 indexed jobId, address indexed client, uint256 budget, string repoUrl);
    event JobJoined(uint256 indexed jobId, address indexed freelancer, uint256 stakedCollateral);
    event MilestoneCompleted(uint256 indexed jobId, uint256 milestoneIndex, uint256 amount);
    event JobDisputed(uint256 indexed jobId, address indexed initiatedBy);
    event DisputeVoted(uint256 indexed jobId, address indexed juror, VoteOption vote);
    event DisputeResolved(uint256 indexed jobId, VoteOption winningOption);
    event JurorRegistered(address indexed juror);

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
    ) external returns (uint256) {
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
            currentMilestone: 0
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

        emit JobCreated(jobId, msg.sender, budget, repoUrl);
        return jobId;
    }

    function joinJob(uint256 jobId) external {
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
        }

        emit JobJoined(jobId, msg.sender, reqStake);
    }

    // --- MILESTONE SETTLEMENT (Feature B) ---

    // Either the Client directly approves, or the automated system (GitHub trigger) calls this
    function approveMilestone(uint256 jobId, uint256 milestoneIndex) external {
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
        platformFeesAccumulated += platformFee;

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
        if (job.currentMilestone == job.milestonesCount) {
            job.status = JobStatus.Completed;
            // Reward freelancer reputation
            reputation[job.freelancer] += 1;
        }

        // Payout to Freelancer: Milestone earnings + Staked Collateral return
        require(
            usdcToken.transfer(job.freelancer, freelancerPayout + stakeReturn),
            "Payout transfer failed"
        );

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

        // Arbitration fee: 3% of the escrowed funds
        uint256 arbitrationFee = (totalEscrowed * 3) / 100;
        uint256 netEscrowed = totalEscrowed - arbitrationFee;

        // Juror incentive: 2% of total distributed to jurors, 1% to platform
        uint256 jurorRewardPool = (totalEscrowed * 2) / 100;
        uint256 platformShare = arbitrationFee - jurorRewardPool;
        platformFeesAccumulated += platformShare;

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
            require(usdcToken.transfer(job.freelancer, netEscrowed), "Freelancer transfer failed");
            reputation[job.freelancer] += 1;
        } 
        else {
            // Split: split netEscrowed 50/50
            uint256 splitAmt = netEscrowed / 2;
            require(usdcToken.transfer(job.client, splitAmt), "Client split failed");
            require(usdcToken.transfer(job.freelancer, splitAmt), "Freelancer split failed");
        }

        emit DisputeResolved(jobId, winner);
    }
}
