import { CircleDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
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

// Check configuration status
export function getCircleConfigStatus() {
  const isCircleConfigured = 
    process.env.CIRCLE_API_KEY && 
    !process.env.CIRCLE_API_KEY.startsWith('TEST_API_KEY') &&
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

// Execute contract payout transaction (Feature B)
export async function executeEscrowApproval(jobId, milestoneIndex) {
  const status = getCircleConfigStatus();
  console.log(`Executing escrow approval for Job #${jobId}, Milestone ${milestoneIndex}. Mode: ${status.mode}`);

  const contractAddress = getContractAddress();
  const abiFunctionSignature = 'approveMilestone(uint256,uint256)';
  const abiParameters = [jobId.toString(), milestoneIndex.toString()];

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
      return {
        success: true,
        mode: 'CIRCLE_DCW',
        txHash: response.txHash || 'Pending',
        transactionId: response.id,
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

    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName: 'approveMilestone',
        args: [BigInt(jobId), BigInt(milestoneIndex)],
      });

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
