// Contract addresses and ABI constants for GigMarket frontend

export const USDC_TOKEN_ADDRESS = '0x3600000000000000000000000000000000000000';
export const EURC_TOKEN_ADDRESS = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a';

// Fallback address in case backend hasn't written it yet
export const DEFAULT_CONTRACT_ADDRESS = '0x789b9868eE8B750e30743E44d0E7d32C42eBe4d8';

// ABI for ERC-20 USDC approvals
export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
];

// ABI for GigMarketEscrow contract
export const GIGMARKET_ESCROW_ABI = [
  {
    name: 'createJob',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'budget', type: 'uint256' },
      { name: 'repoUrl', type: 'string' },
      { name: 'milestoneBudgets', type: 'uint256[]' },
      { name: 'milestoneTitles', type: 'string[]' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'joinJob',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'approveMilestone',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'milestoneIndex', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'initiateDispute',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'registerAsJuror',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    name: 'voteOnDispute',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'vote', type: 'uint8' }
    ],
    outputs: []
  },
  {
    name: 'resolveDispute',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'getRequiredStakePercentage',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'freelancerAddress', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'calculateRequiredStake',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'freelancerAddress', type: 'address' },
      { name: 'budget', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getDisputeVotesInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [
      { name: 'clientVotes', type: 'uint256' },
      { name: 'freelancerVotes', type: 'uint256' },
      { name: 'splitVotes', type: 'uint256' },
      { name: 'totalVoters', type: 'uint256' }
    ]
  },
  {
    name: 'jobs',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'client', type: 'address' },
      { name: 'freelancer', type: 'address' },
      { name: 'budget', type: 'uint256' },
      { name: 'freelancerStake', type: 'uint256' },
      { name: 'requiredStake', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'repoUrl', type: 'string' },
      { name: 'creationTime', type: 'uint256' },
      { name: 'milestonesCount', type: 'uint256' },
      { name: 'currentMilestone', type: 'uint256' }
    ]
  },
  {
    name: 'jobMilestones',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'uint256' }
    ],
    outputs: [
      { name: 'budget', type: 'uint256' },
      { name: 'title', type: 'string' },
      { name: 'completed', type: 'bool' },
      { name: 'approved', type: 'bool' }
    ]
  },
  {
    name: 'isJuror',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'reputation',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'jobCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
];
