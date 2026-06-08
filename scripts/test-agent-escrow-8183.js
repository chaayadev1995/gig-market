import { createWalletClient, createPublicClient, http, defineChain, encodePacked, keccak256 } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import fs from 'fs';
import path from 'path';

// Define local hardhat chain
const localHardhat = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  network: 'hardhat',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
});

// Standard Hardhat dev accounts
const clientAccount = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'); // Account 0
const agentAccount = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'); // Account 1

async function main() {
  const publicClient = createPublicClient({
    chain: localHardhat,
    transport: http(),
  });

  const clientWallet = createWalletClient({
    account: clientAccount,
    chain: localHardhat,
    transport: http(),
  });

  const agentWallet = createWalletClient({
    account: agentAccount,
    chain: localHardhat,
    transport: http(),
  });

  const evaluatorWallet = clientWallet; // Using Client account as Evaluator as well

  console.log('--- START ERC-8183 AUTONOMOUS JOB ESCROW & SETTLEMENT PIPELINE TEST ---');
  console.log(`Client Address: ${clientAccount.address}`);
  console.log(`AI Agent Provider Address: ${agentAccount.address}`);
  console.log(`Evaluator/Oracle Address: ${clientAccount.address}`);

  // 1. Deploy MockUSDC
  const usdcArtifact = JSON.parse(fs.readFileSync('./artifacts_contract/contracts/MockUSDC.sol/MockUSDC.json', 'utf8'));
  console.log('Deploying MockUSDC...');
  let hash = await clientWallet.deployContract({
    abi: usdcArtifact.abi,
    bytecode: usdcArtifact.bytecode,
  });
  let receipt = await publicClient.waitForTransactionReceipt({ hash });
  const usdcAddress = receipt.contractAddress;
  console.log(`MockUSDC deployed at: ${usdcAddress}`);

  // Mint USDC to client and agent
  console.log('Minting MockUSDC to client and agent...');
  hash = await clientWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'mint',
    args: [clientAccount.address, 1000n * 1000000n],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  hash = await clientWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'mint',
    args: [agentAccount.address, 200n * 1000000n], // Staking collateral budget
  });
  await publicClient.waitForTransactionReceipt({ hash });
  console.log('MockUSDC minted successfully.');

  // 2. Deploy AgentEscrow8183
  const escrowArtifact = JSON.parse(fs.readFileSync('./artifacts_contract/contracts/AgentEscrow8183.sol/AgentEscrow8183.json', 'utf8'));
  console.log('Deploying AgentEscrow8183...');
  hash = await clientWallet.deployContract({
    abi: escrowArtifact.abi,
    bytecode: escrowArtifact.bytecode,
  });
  receipt = await publicClient.waitForTransactionReceipt({ hash });
  const escrowAddress = receipt.contractAddress;
  console.log(`AgentEscrow8183 deployed at: ${escrowAddress}`);

  // ==================== WORKFLOW 1: SUCCESSFUL PATH ====================
  console.log('\n=== Workflow 1: Successful Completion Path ===');
  const jobId = 1n;
  const jobBudget = 100n * 1000000n; // 100 USDC
  const agentCollateral = 10n * 1000000n; // 10 USDC (10%)
  const expiry = BigInt(Math.floor(Date.now() / 1000) + 3600);

  // 3. Create Job
  console.log(`[Client] Creating Job #${jobId} targeting Agent...`);
  hash = await clientWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'createJob',
    args: [agentAccount.address, clientAccount.address, usdcAddress, jobBudget, expiry],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // 4. Fund Job
  console.log(`[Client] Approving and Funding Job #${jobId}...`);
  hash = await clientWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'approve',
    args: [escrowAddress, jobBudget],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  hash = await clientWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'fundJob',
    args: [jobId],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  console.log('Job funded.');

  // 5. Agent Commit & Staking Collateral
  console.log('[Agent] Generating handshake signature...');
  const messageHash = keccak256(
    encodePacked(['uint256', 'address'], [jobId, agentAccount.address])
  );
  const signature = await agentWallet.signMessage({
    message: { raw: messageHash },
  });
  console.log(`Signature: ${signature}`);

  console.log('[Agent] Approving collateral stake...');
  hash = await agentWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'approve',
    args: [escrowAddress, agentCollateral],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  console.log('[Agent] Executing commitment signature handshake...');
  hash = await agentWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'commitToJob',
    args: [jobId, signature],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  console.log('Agent commitment completed on-chain.');

  // 6. Agent Submit Work
  console.log('[Agent] Submitting work deliverable...');
  const deliverableHash = keccak256(Buffer.from('workflow-1-results'));
  hash = await agentWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'submitWork',
    args: [jobId, deliverableHash],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  console.log('Work submitted.');

  // 7. Evaluator Complete Job
  console.log('[Evaluator] Verifying and completing job...');
  const initialAgentUSDC = await publicClient.readContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'balanceOf',
    args: [agentAccount.address],
  });

  hash = await evaluatorWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'completeJob',
    args: [jobId],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  const finalAgentUSDC = await publicClient.readContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'balanceOf',
    args: [agentAccount.address],
  });

  console.log(`Agent USDC before payout: ${Number(initialAgentUSDC) / 1e6} USDC`);
  console.log(`Agent USDC after payout: ${Number(finalAgentUSDC) / 1e6} USDC`);
  const expectedPayout = jobBudget + agentCollateral;
  console.log(`Received amount: ${Number(finalAgentUSDC - initialAgentUSDC) / 1e6} USDC (Expected: ${Number(expectedPayout) / 1e6} USDC)`);
  
  if (finalAgentUSDC - initialAgentUSDC !== expectedPayout) {
    throw new Error('Payout mismatch: Agent did not receive budget + collateral!');
  }
  console.log('SUCCESS: Successful completion path verified.');


  // ==================== WORKFLOW 2: REJECTION PATH ====================
  console.log('\n=== Workflow 2: Rejection & Slashed Collateral Path ===');
  const jobId2 = 2n;

  // 1. Create Job 2
  console.log(`[Client] Creating Job #${jobId2}...`);
  hash = await clientWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'createJob',
    args: [agentAccount.address, clientAccount.address, usdcAddress, jobBudget, expiry],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // 2. Fund Job 2
  hash = await clientWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'approve',
    args: [escrowAddress, jobBudget],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  hash = await clientWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'fundJob',
    args: [jobId2],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // 3. Agent Commit Job 2
  const messageHash2 = keccak256(
    encodePacked(['uint256', 'address'], [jobId2, agentAccount.address])
  );
  const signature2 = await agentWallet.signMessage({
    message: { raw: messageHash2 },
  });

  hash = await agentWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'approve',
    args: [escrowAddress, agentCollateral],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  hash = await agentWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'commitToJob',
    args: [jobId2, signature2],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // 4. Agent Submit Work Job 2
  const deliverableHash2 = keccak256(Buffer.from('workflow-2-failed-results'));
  hash = await agentWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'submitWork',
    args: [jobId2, deliverableHash2],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // 5. Evaluator Rejects Job 2 (Slashes Agent Collateral)
  const initialClientUSDC = await publicClient.readContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'balanceOf',
    args: [clientAccount.address],
  });

  console.log('[Evaluator] Rejecting job and slashing collateral...');
  hash = await evaluatorWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'rejectJob',
    args: [jobId2],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  const finalClientUSDC = await publicClient.readContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'balanceOf',
    args: [clientAccount.address],
  });

  console.log(`Client USDC before rejection: ${Number(initialClientUSDC) / 1e6} USDC`);
  console.log(`Client USDC after rejection: ${Number(finalClientUSDC) / 1e6} USDC`);
  const expectedRefund = jobBudget + agentCollateral; // Budget + Slashed Collateral
  console.log(`Refunded amount to Client: ${Number(finalClientUSDC - initialClientUSDC) / 1e6} USDC (Expected: ${Number(expectedRefund) / 1e6} USDC)`);

  if (finalClientUSDC - initialClientUSDC !== expectedRefund) {
    throw new Error('Rejection slash mismatch: Client did not receive budget + slashed collateral!');
  }
  console.log('SUCCESS: Rejection and slashing logic successfully verified.');

  console.log('\n--- ALL ERC-8183 INTEGRATION TESTS PASSED SUCCESSFULLY ---');
}

main().catch(e => {
  console.error("ERROR MESSAGE:", e.message || e);
  if (e.shortMessage) console.error("SHORT MESSAGE:", e.shortMessage);
  process.exit(1);
});
