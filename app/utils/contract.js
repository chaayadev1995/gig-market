// Contract addresses and ABI constants for GigMarket frontend

export const USDC_TOKEN_ADDRESS = '0x3600000000000000000000000000000000000000';
export const EURC_TOKEN_ADDRESS = '0x5fbd38c09c806e3972b4ae669b932190ad91a49f';
export const STABLE_FX_ROUTER_ADDRESS = '0xc5d96c53c5704395b463a8f2c8c38a682909f935';

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
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' }
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
    name: 'createPrivateJob',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'budgetCommitment', type: 'bytes32' },
      { name: 'zkpProof', type: 'bytes' },
      { name: 'encryptedDetails', type: 'string' },
      { name: 'publicBudgetAmount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'joinPrivateJob',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'freelancerStakeAmount', type: 'uint256' },
      { name: 'stakeCommitment', type: 'bytes32' },
      { name: 'zkpProof', type: 'bytes' }
    ],
    outputs: []
  },
  {
    name: 'approvePrivateMilestone',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'milestoneIndex', type: 'uint256' },
      { name: 'payoutAmount', type: 'uint256' },
      { name: 'payoutCommitment', type: 'bytes32' },
      { name: 'zkpProof', type: 'bytes' },
      { name: 'isLastMilestone', type: 'bool' }
    ],
    outputs: []
  },
  {
    name: 'isPrivateJob',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'jobEncryptedDetails',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }]
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
  },
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }]
  }
];

export const AGENT_ESCROW_8183_ABI = [
  {
    name: 'createJob',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'provider', type: 'address' },
      { name: 'evaluator', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'expiry', type: 'uint256' }
    ],
    outputs: [{ name: 'jobId', type: 'uint256' }]
  },
  {
    name: 'fundJob',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'commitToJob',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'signature', type: 'bytes' }
    ],
    outputs: []
  },
  {
    name: 'submitWork',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'deliverableHash', type: 'bytes32' }
    ],
    outputs: []
  },
  {
    name: 'completeJob',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'rejectJob',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'getJob',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        name: '',
        components: [
          { name: 'client', type: 'address' },
          { name: 'provider', type: 'address' },
          { name: 'evaluator', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'expiry', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'deliverableHash', type: 'bytes32' }
        ]
      }
    ]
  },
  {
    name: 'jobs',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'client', type: 'address' },
      { name: 'provider', type: 'address' },
      { name: 'evaluator', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'expiry', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'deliverableHash', type: 'bytes32' }
    ]
  },
  {
    name: 'jobCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
];

