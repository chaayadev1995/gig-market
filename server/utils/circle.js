import { CircleDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import { initiateSmartContractPlatformClient } from '@circle-fin/smart-contract-platform';
import { createWalletClient, createPublicClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Arc Testnet chain definition
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
    },
    public: {
      http: ['https://rpc.testnet.arc.network'],
    },
  },
});

const CONTRACT_ADDRESS_PATH = path.resolve('./db/contract-address.json');

// Helper to get active contract address
export function getContractAddress() {
  if (fs.existsSync(CONTRACT_ADDRESS_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONTRACT_ADDRESS_PATH, 'utf8'));
      return data.GigMarketEscrow;
    } catch (e) {
      console.error('Error reading contract address:', e);
    }
  }
  return '0x789b9868eE8B750e30743E44d0E7d32C42eBe4d8'; // Fallback
}

// Helper to get active AgentEscrow8183 address
export function getAgentEscrow8183Address() {
  if (fs.existsSync(CONTRACT_ADDRESS_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONTRACT_ADDRESS_PATH, 'utf8'));
      return data.AgentEscrow8183;
    } catch (e) {
      console.error('Error reading AgentEscrow8183 address:', e);
    }
  }
  return null;
}

// Check configuration status
export function getCircleConfigStatus() {
  const isCircleConfigured = 
    process.env.CIRCLE_API_KEY && 
    !process.env.CIRCLE_API_KEY.startsWith('TEST_API_KEY_PLACEHOLDER') &&
    process.env.CIRCLE_WALLET_ID && 
    process.env.CIRCLE_WALLET_ID !== 'your-circle-wallet-id-here';

  const isPrivateKeyConfigured =
    process.env.PRIVATE_KEY &&
    process.env.PRIVATE_KEY !== '0x0000000000000000000000000000000000000000000000000000000000000000';

  return {
    mode: isCircleConfigured ? 'CIRCLE_DCW' : 'LOCAL_KEY_FALLBACK',
    isCircleConfigured,
    isPrivateKeyConfigured,
    circleWalletId: process.env.CIRCLE_WALLET_ID,
    hasApiKey: !!process.env.CIRCLE_API_KEY,
    hasEntitySecret: !!process.env.CIRCLE_ENTITY_SECRET,
    paymasterAddress: process.env.CIRCLE_PAYMASTER_ADDRESS || '0x0000000071727E5C77c03C68673752c289654e53',
    paymasterPolicyId: process.env.CIRCLE_PAYMASTER_POLICY_ID || 'policy_eaacebab-81c3-47d5-a0b6-5721cdd7f2e8',
  };
}

export function getScpClient() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  if (!apiKey || !entitySecret) {
    throw new Error('CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET must be configured for SCP');
  }
  return initiateSmartContractPlatformClient({
    apiKey,
    entitySecret,
  });
}

export async function deployContractViaScp(name, abiJson, bytecode, constructorParameters = []) {
  const client = getScpClient();
  const walletId = process.env.CIRCLE_WALLET_ID;
  if (!walletId) {
    throw new Error('CIRCLE_WALLET_ID must be configured for SCP deployment');
  }

  console.log(`[SCP Deploy] Deploying ${name} on ARC-TESTNET using wallet: ${walletId}...`);
  const response = await client.deployContract({
    name,
    description: `GigMarket contract ${name}`,
    blockchain: 'ARC-TESTNET',
    walletId,
    abiJson,
    bytecode,
    constructorParameters,
    fee: {
      type: 'level',
      config: {
        feeLevel: 'MEDIUM',
      },
    },
  });

  const contractDeployment = response.data;
  const contractId = contractDeployment.contractId;
  const transactionId = contractDeployment.transactionId;
  console.log(`[SCP Deploy] Contract deployment initiated. ID: ${contractId}, TxID: ${transactionId}`);

  // Poll for completion
  console.log(`[SCP Deploy] Polling status of contract ID: ${contractId}...`);
  let contract;
  while (true) {
    const getRes = await client.getContract({ id: contractId });
    contract = getRes.data.contract;
    console.log(`[SCP Deploy] Polling contract status: ${contract.status}`);
    if (contract.status === 'COMPLETE') {
      break;
    }
    if (contract.status === 'FAILED') {
      throw new Error(`[SCP Deploy] Contract deployment failed: ${contract.deploymentErrorReason || 'Unknown error'} - ${contract.deploymentErrorDetails || ''}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  console.log(`[SCP Deploy] Successfully deployed ${name} to address: ${contract.contractAddress}`);
  return {
    contractAddress: contract.contractAddress,
    contractId: contractId,
    transactionId: transactionId
  };
}

export async function createEventMonitorViaScp(contractAddress, eventSignature) {
  const client = getScpClient();
  console.log(`[SCP Monitor] Registering monitor for event: ${eventSignature} on contract ${contractAddress}...`);
  try {
    const response = await client.createEventMonitor({
      blockchain: 'ARC-TESTNET',
      contractAddress,
      eventSignature,
      idempotencyKey: crypto.randomUUID()
    });
    console.log(`[SCP Monitor] Event monitor registered. ID: ${response.data?.eventMonitor?.id}`);
    return response.data?.eventMonitor;
  } catch (error) {
    console.warn(`[SCP Monitor] Failed to create event monitor (might already exist):`, error.message);
    return null;
  }
}

// Execute contract payout transaction (Feature B)
export async function executeEscrowApproval(jobId, milestoneIndex) {
  const status = getCircleConfigStatus();
  console.log(`Executing escrow approval for Job #${jobId}, Milestone ${milestoneIndex}. Mode: ${status.mode}`);

  const contractAddress = getContractAddress();
  
  // Create public client to query the contract
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(),
  });

  // Read ABI from hardhat compilation artifacts
  const artifactPath = path.resolve('./artifacts_contract/contracts/GigMarketEscrow.sol/GigMarketEscrow.json');
  if (!fs.existsSync(artifactPath)) {
    throw new Error('Contract JSON artifact not found. Please compile the contract first ("npm run compile").');
  }

  const contractJson = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abi = contractJson.abi;

  // Determine preferred currency and slippage requirements
  let payoutCurrency = 'USDC';
  let minAmountEURC = 0n;

  try {
    const pref = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: 'jobPayoutCurrency',
      args: [BigInt(jobId)],
    });
    if (pref) {
      payoutCurrency = pref;
    }
  } catch (err) {
    console.warn(`[StableFX] Could not fetch jobPayoutCurrency for Job #${jobId}, defaulting to USDC:`, err.message);
  }

  if (payoutCurrency === 'EURC') {
    try {
      console.log('[StableFX] EURC preference detected. Fetching job/milestone details for swap calculation...');
      const job = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: 'jobs',
        args: [BigInt(jobId)],
      });

      const milestone = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: 'jobMilestones',
        args: [BigInt(jobId), BigInt(milestoneIndex)],
      });

      const milestoneBudget = BigInt(milestone[0]);
      const jobBudget = BigInt(job[3]);
      const jobRequiredStake = BigInt(job[5]);
      const jobFreelancerStake = BigInt(job[4]);

      const platformFee = milestoneBudget / 100n;
      const freelancerPayout = milestoneBudget - platformFee;
      let stakeReturn = 0n;
      if (jobRequiredStake > 0n) {
        stakeReturn = (jobRequiredStake * milestoneBudget) / jobBudget;
        if (stakeReturn > jobFreelancerStake) {
          stakeReturn = jobFreelancerStake;
        }
      }
      const totalPayoutUSDC = freelancerPayout + stakeReturn;

      // Fetch FX quote
      let quoteRate = 0.92;
      try {
        const apiKey = process.env.CIRCLE_API_KEY;
        if (apiKey && !apiKey.startsWith('TEST_API_KEY_PLACEHOLDER')) {
          const isSandbox = apiKey.startsWith('SANDBOX') || apiKey.includes('test') || apiKey.includes('sandbox') || apiKey.startsWith('TEST_API_KEY');
          const baseUrl = isSandbox ? 'https://api-sandbox.circle.com' : 'https://api.circle.com';
          const response = await $fetch(`${baseUrl}/v1/exchange/stablefx/quotes`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: {
              from: {
                currency: 'USDC',
                amount: (Number(totalPayoutUSDC) / 1e6).toFixed(2)
              },
              to: {
                currency: 'EURC'
              }
            }
          });
          if (response && response.price) {
            quoteRate = parseFloat(response.price);
          }
        }
      } catch (quoteErr) {
        console.warn('[StableFX] Failed to fetch live FX quote, using fallback 0.92:', quoteErr.message);
      }

      const expectedEURC = Number(totalPayoutUSDC) * quoteRate;
      minAmountEURC = BigInt(Math.floor(expectedEURC * 0.99)); // 1% slippage allowance
      console.log(`[StableFX] Calculated swap: ${totalPayoutUSDC.toString()} USDC -> EURC. Min expected output: ${minAmountEURC.toString()}`);
    } catch (calcErr) {
      console.error('[StableFX] Failed to calculate EURC swap params, defaulting minAmountEURC to 0:', calcErr.message);
    }
  }

  const isEurcSwap = payoutCurrency === 'EURC';
  const abiFunctionSignature = isEurcSwap 
    ? 'approveMilestoneWithSlippage(uint256,uint256,uint256)' 
    : 'approveMilestone(uint256,uint256)';
  const abiParameters = isEurcSwap 
    ? [jobId.toString(), milestoneIndex.toString(), minAmountEURC.toString()] 
    : [jobId.toString(), milestoneIndex.toString()];

  if (status.mode === 'CIRCLE_DCW') {
    // 1. CIRCLE DEVELOPER-CONTROLLED WALLET MODE
    console.log('Sending transaction via Circle DCW SDK...');
    const client = new CircleDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET,
    });

    const idempotencyKey = crypto.randomUUID();
    
    try {
      const response = await client.createContractExecutionTransaction({
        walletId: process.env.CIRCLE_WALLET_ID,
        contractAddress: contractAddress,
        abiFunctionSignature: abiFunctionSignature,
        abiParameters: abiParameters,
        feeLevel: 'MEDIUM',
        idempotencyKey: idempotencyKey,
      });

      console.log('Circle DCW transaction response:', response);
      let txHash = response.txHash;
      if (!txHash) {
        try {
          console.log(`Polling transaction ${response.id} until state is SENT...`);
          const txRes = await client.getTransaction({
            id: response.id,
            waitForState: 'SENT'
          });
          txHash = txRes.data?.transaction?.txHash;
        } catch (txErr) {
          console.warn('Failed to wait for transaction state:', txErr.message);
        }
      }

      return {
        success: true,
        mode: 'CIRCLE_DCW',
        txHash: txHash || 'Pending',
        transactionId: response.id,
        scpTransactionId: response.id,
      };
    } catch (error) {
      console.error('Circle DCW transaction execution failed:', error);
      throw error;
    }
  } else {
    // 2. LOCAL PRIVATE KEY FALLBACK MODE (Viem)
    console.log('Sending transaction via Viem and Local Private Key...');
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.startsWith('0x0000')) {
      throw new Error('Local fallback private key is not configured. Please add PRIVATE_KEY to .env');
    }

    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http(),
    });

    try {
      let hash;
      if (isEurcSwap) {
        hash = await walletClient.writeContract({
          address: contractAddress,
          abi,
          functionName: 'approveMilestoneWithSlippage',
          args: [BigInt(jobId), BigInt(milestoneIndex), minAmountEURC],
        });
      } else {
        hash = await walletClient.writeContract({
          address: contractAddress,
          abi,
          functionName: 'approveMilestone',
          args: [BigInt(jobId), BigInt(milestoneIndex)],
        });
      }

      console.log(`Viem transaction sent: ${hash}`);
      console.log('Waiting for receipt...');
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        mode: 'LOCAL_KEY_FALLBACK',
        txHash: hash,
        blockNumber: receipt.blockNumber.toString(),
      };
    } catch (error) {
      console.error('Viem transaction execution failed:', error);
      throw error;
    }
  }
}

// Relays permissionless CCTP minting on Arc Testnet gaslessly
export async function executeReceiveMessage(messageBytes, attestationSignature) {
  const status = getCircleConfigStatus();
  console.log(`Executing CCTP receiveMessage. Mode: ${status.mode}`);

  const transmitterAddress = '0x26413b5220c926949a0e6760f38b16c1E11D3156';
  const abiFunctionSignature = 'receiveMessage(bytes,bytes)';
  const abiParameters = [messageBytes, attestationSignature];

  if (status.mode === 'CIRCLE_DCW') {
    const client = new CircleDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET,
    });

    const idempotencyKey = crypto.randomUUID();
    
    try {
      const response = await client.createContractExecutionTransaction({
        walletId: process.env.CIRCLE_WALLET_ID,
        contractAddress: transmitterAddress,
        abiFunctionSignature: abiFunctionSignature,
        abiParameters: abiParameters,
        feeLevel: 'MEDIUM',
        idempotencyKey: idempotencyKey,
      });

      console.log('Circle DCW receiveMessage response:', response);
      let txHash = response.txHash;
      if (!txHash) {
        try {
          console.log(`Polling transaction ${response.id} until state is SENT...`);
          const txRes = await client.getTransaction({
            id: response.id,
            waitForState: 'SENT'
          });
          txHash = txRes.data?.transaction?.txHash;
        } catch (txErr) {
          console.warn('Failed to wait for transaction state:', txErr.message);
        }
      }

      return {
        success: true,
        mode: 'CIRCLE_DCW',
        txHash: txHash || 'Pending',
        transactionId: response.id,
        scpTransactionId: response.id,
      };
    } catch (error) {
      console.error('Circle DCW CCTP receiveMessage failed:', error);
      throw error;
    }
  } else {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.startsWith('0x0000')) {
      throw new Error('Local fallback private key is not configured. Please add PRIVATE_KEY to .env');
    }

    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http(),
    });

    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http(),
    });

    const abi = [
      {
        name: 'receiveMessage',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'message', type: 'bytes' },
          { name: 'attestation', type: 'bytes' }
        ],
        outputs: [{ name: 'success', type: 'bool' }]
      }
    ];

    try {
      const hash = await walletClient.writeContract({
        address: transmitterAddress,
        abi,
        functionName: 'receiveMessage',
        args: [messageBytes, attestationSignature],
      });

      console.log(`Viem CCTP receiveMessage sent: ${hash}`);
      await publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        txHash: hash,
      };
    } catch (error) {
      console.error('Viem CCTP receiveMessage failed:', error);
      throw error;
    }
  }
}

// Executes AgentEscrow8183 completion or rejection by the platform evaluator
export async function executeAgentEscrowAttestation(jobId, action) {
  const status = getCircleConfigStatus();
  console.log(`Executing AgentEscrow attestation [${action}] for Job #${jobId}. Mode: ${status.mode}`);

  const contractAddress = getAgentEscrow8183Address();
  if (!contractAddress) {
    throw new Error('AgentEscrow8183 address not configured in db/contract-address.json');
  }

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(),
  });

  const artifactPath = path.resolve('./artifacts_contract/contracts/AgentEscrow8183.sol/AgentEscrow8183.json');
  if (!fs.existsSync(artifactPath)) {
    throw new Error('AgentEscrow8183 JSON artifact not found.');
  }

  const contractJson = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abi = contractJson.abi;

  const abiFunctionSignature = `${action}(uint256)`;
  const abiParameters = [jobId.toString()];

  if (status.mode === 'CIRCLE_DCW') {
    const client = new CircleDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET,
    });

    const idempotencyKey = crypto.randomUUID();
    
    try {
      const response = await client.createContractExecutionTransaction({
        walletId: process.env.CIRCLE_WALLET_ID,
        contractAddress: contractAddress,
        abiFunctionSignature: abiFunctionSignature,
        abiParameters: abiParameters,
        feeLevel: 'MEDIUM',
        idempotencyKey: idempotencyKey,
      });

      console.log(`Circle DCW ${action} response:`, response);
      let txHash = response.txHash;
      if (!txHash) {
        try {
          console.log(`Polling transaction ${response.id} until state is SENT...`);
          const txRes = await client.getTransaction({
            id: response.id,
            waitForState: 'SENT'
          });
          txHash = txRes.data?.transaction?.txHash;
        } catch (txErr) {
          console.warn('Failed to wait for transaction state:', txErr.message);
        }
      }

      return {
        success: true,
        mode: 'CIRCLE_DCW',
        txHash: txHash || 'Pending',
        transactionId: response.id,
        scpTransactionId: response.id,
      };
    } catch (error) {
      console.error(`Circle DCW ${action} execution failed:`, error);
      throw error;
    }
  } else {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.startsWith('0x0000')) {
      throw new Error('Local fallback private key is not configured.');
    }

    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http(),
    });

    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName: action,
        args: [BigInt(jobId)],
      });

      console.log(`Viem transaction sent for ${action}: ${hash}`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        mode: 'LOCAL_KEY_FALLBACK',
        txHash: hash,
        blockNumber: receipt.blockNumber.toString(),
      };
    } catch (error) {
      console.error(`Viem ${action} execution failed:`, error);
      throw error;
    }
  }
}

// Implement Gateway balance checks
import { getUserProfile } from './users.js';

export async function getGatewayBalance(walletAddress) {
  if (!walletAddress) return 0;
  
  const status = getCircleConfigStatus();
  if (status.isCircleConfigured && process.env.CIRCLE_API_KEY) {
    try {
      const baseUrl = 'https://gateway-api-testnet.circle.com/v1/balances';
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CIRCLE_API_KEY}`
        },
        body: JSON.stringify({
          sources: [
            {
              depositor: walletAddress
            }
          ]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const balances = data.balances || (data.data && data.data.balances) || [];
        const usdcBalance = balances.find(b => b.token === 'USDC' || b.tokenAddress?.toLowerCase() === '0x3600000000000000000000000000000000000000');
        if (usdcBalance) {
          return parseFloat(usdcBalance.amount || usdcBalance.balance || '0');
        }
      }
    } catch (e) {
      console.warn('Failed to fetch gateway balance from Circle API, falling back to local registry:', e.message);
    }
  }
  
  // Fallback to local DB balance
  const user = getUserProfile(walletAddress);
  return user ? user.gatewayBalance : 0;
}

// Execute on-chain USDC transfer from platform wallet to recipient (settlement)
export async function executeUsdcTransfer(recipientAddress, amountUSDC) {
  const status = getCircleConfigStatus();
  console.log(`Executing on-chain USDC transfer of ${amountUSDC} USDC to ${recipientAddress}. Mode: ${status.mode}`);

  const usdcAddress = '0x3600000000000000000000000000000000000000'; // Arc Testnet USDC
  const amountUnits = BigInt(Math.floor(amountUSDC * 1000000)); // 6 decimals

  const erc20Abi = [
    {
      name: 'transfer',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'recipient', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      outputs: [{ name: '', type: 'bool' }],
    },
  ];

  if (status.mode === 'CIRCLE_DCW') {
    const client = new CircleDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET,
    });

    const idempotencyKey = crypto.randomUUID();
    
    try {
      const response = await client.createContractExecutionTransaction({
        walletId: process.env.CIRCLE_WALLET_ID,
        contractAddress: usdcAddress,
        abiFunctionSignature: 'transfer(address,uint256)',
        abiParameters: [recipientAddress, amountUnits.toString()],
        feeLevel: 'MEDIUM',
        idempotencyKey: idempotencyKey,
      });

      console.log('Circle DCW USDC transfer response:', response);
      let txHash = response.txHash;
      if (!txHash) {
        try {
          console.log(`Polling transaction ${response.id} until state is SENT...`);
          const txRes = await client.getTransaction({
            id: response.id,
            waitForState: 'SENT'
          });
          txHash = txRes.data?.transaction?.txHash;
        } catch (txErr) {
          console.warn('Failed to wait for transaction state:', txErr.message);
        }
      }

      return {
        success: true,
        mode: 'CIRCLE_DCW',
        txHash: txHash || 'Pending',
        transactionId: response.id,
        scpTransactionId: response.id,
      };
    } catch (error) {
      console.error('Circle DCW USDC transfer failed:', error);
      throw error;
    }
  } else {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.startsWith('0x0000')) {
      throw new Error('Local fallback private key is not configured.');
    }

    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http(),
    });

    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http(),
    });

    try {
      const hash = await walletClient.writeContract({
        address: usdcAddress,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [recipientAddress, amountUnits],
      });

      console.log(`USDC Transfer transaction sent: ${hash}`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        mode: 'LOCAL_KEY_FALLBACK',
        txHash: hash,
        blockNumber: receipt.blockNumber.toString(),
      };
    } catch (error) {
      console.error('Viem USDC Transfer failed:', error);
      throw error;
    }
  }
}


