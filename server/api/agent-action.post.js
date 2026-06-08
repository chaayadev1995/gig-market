import fs from 'fs';
import path from 'path';
import { readBody, defineEventHandler } from 'h3';
import { getAgentEscrow8183Address, getCircleConfigStatus, arcTestnet } from '../utils/circle';
import { createPublicClient, createWalletClient, http, keccak256 } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import crypto from 'crypto';
import { CircleDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

const USDC_TOKEN_ADDRESS = '0x3600000000000000000000000000000000000000';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log('Agent action request received:', body);

  const { jobId, action, deliverableHash } = body;
  if (!jobId || !action) {
    return { error: 'Missing required parameters: jobId, action' };
  }

  const status = getCircleConfigStatus();
  const contractAddress = getAgentEscrow8183Address();
  if (!contractAddress) {
    return { error: 'AgentEscrow8183 address not configured in db/contract-address.json' };
  }

  // Load ABI
  const artifactPath = path.resolve('./artifacts_contract/contracts/AgentEscrow8183.sol/AgentEscrow8183.json');
  if (!fs.existsSync(artifactPath)) {
    return { error: 'AgentEscrow8183 JSON artifact not found.' };
  }
  const contractJson = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abi = contractJson.abi;

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(),
  });

  // Get agent address (our backend wallet address)
  let agentAddress;
  if (status.mode === 'LOCAL_KEY_FALLBACK') {
    const account = privateKeyToAccount(process.env.PRIVATE_KEY);
    agentAddress = account.address;
  } else {
    const client = new CircleDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET,
    });
    const walletInfo = await client.getWallet({ id: process.env.CIRCLE_WALLET_ID });
    agentAddress = walletInfo.wallet?.address;
  }

  if (action === 'commit') {
    console.log(`[Agent Action] Committing to job #${jobId} as agent ${agentAddress}...`);

    // 1. Fetch job budget from contract to calculate collateral (10%)
    const jobData = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: 'jobs',
      args: [BigInt(jobId)],
    });
    
    const amount = jobData[4]; // budget amount
    const collateral = amount / 10n;
    console.log(`Job budget: ${amount.toString()} USDC. Required collateral: ${collateral.toString()} USDC.`);

    // 2. Generate signature: hash of (jobId, agentAddress)
    const { encodePacked } = await import('viem');
    const messageHash = keccak256(
      encodePacked(['uint256', 'address'], [BigInt(jobId), agentAddress])
    );
    
    // We sign it on server using private key
    let signature;
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.startsWith('0x0000')) {
      return { error: 'PRIVATE_KEY not configured for message signing' };
    }
    const account = privateKeyToAccount(privateKey);
    signature = await account.signMessage({
      message: { raw: messageHash }
    });

    console.log(`Generated agent commitment signature: ${signature}`);

    // 3. Approve contract to pull collateral from agent
    console.log(`[Agent Action] Approving ${collateral.toString()} USDC collateral...`);
    if (status.mode === 'CIRCLE_DCW') {
      const client = new CircleDeveloperControlledWalletsClient({
        apiKey: process.env.CIRCLE_API_KEY,
        entitySecret: process.env.CIRCLE_ENTITY_SECRET,
      });

      // Approve USDC
      await client.createContractExecutionTransaction({
        walletId: process.env.CIRCLE_WALLET_ID,
        contractAddress: USDC_TOKEN_ADDRESS,
        abiFunctionSignature: 'approve(address,uint256)',
        abiParameters: [contractAddress, collateral.toString()],
        feeLevel: 'MEDIUM',
        idempotencyKey: crypto.randomUUID(),
      });

      // Call commitToJob(uint256,bytes)
      const txRes = await client.createContractExecutionTransaction({
        walletId: process.env.CIRCLE_WALLET_ID,
        contractAddress: contractAddress,
        abiFunctionSignature: 'commitToJob(uint256,bytes)',
        abiParameters: [jobId.toString(), signature],
        feeLevel: 'MEDIUM',
        idempotencyKey: crypto.randomUUID(),
      });

      return {
        success: true,
        action: 'commit',
        txHash: txRes.txHash || 'Pending',
        signature
      };
    } else {
      const walletClient = createWalletClient({
        account,
        chain: arcTestnet,
        transport: http(),
      });

      // USDC approve ABI
      const usdcAbi = [
        {
          name: 'approve',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' }
          ],
          outputs: [{ name: '', type: 'bool' }]
        }
      ];

      // Approve USDC
      const approveHash = await walletClient.writeContract({
        address: USDC_TOKEN_ADDRESS,
        abi: usdcAbi,
        functionName: 'approve',
        args: [contractAddress, collateral],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      // Call commitToJob
      const commitHash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName: 'commitToJob',
        args: [BigInt(jobId), signature],
      });
      await publicClient.waitForTransactionReceipt({ hash: commitHash });

      return {
        success: true,
        action: 'commit',
        txHash: commitHash,
        signature
      };
    }
  }

  if (action === 'submit') {
    const hashBytes = deliverableHash || keccak256(Buffer.from('deliverable-payload'));
    console.log(`[Agent Action] Submitting work deliverable hash: ${hashBytes} for job #${jobId}`);

    if (status.mode === 'CIRCLE_DCW') {
      const client = new CircleDeveloperControlledWalletsClient({
        apiKey: process.env.CIRCLE_API_KEY,
        entitySecret: process.env.CIRCLE_ENTITY_SECRET,
      });

      const txRes = await client.createContractExecutionTransaction({
        walletId: process.env.CIRCLE_WALLET_ID,
        contractAddress: contractAddress,
        abiFunctionSignature: 'submitWork(uint256,bytes32)',
        abiParameters: [jobId.toString(), hashBytes],
        feeLevel: 'MEDIUM',
        idempotencyKey: crypto.randomUUID(),
      });

      return {
        success: true,
        action: 'submit',
        txHash: txRes.txHash || 'Pending',
        deliverableHash: hashBytes
      };
    } else {
      const walletClient = createWalletClient({
        account,
        chain: arcTestnet,
        transport: http(),
      });

      const txHash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName: 'submitWork',
        args: [BigInt(jobId), hashBytes],
      });
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      return {
        success: true,
        action: 'submit',
        txHash,
        deliverableHash: hashBytes
      };
    }
  }

  return { error: `Invalid action: ${action}` };
});
