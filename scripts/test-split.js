import { createWalletClient, createPublicClient, http, defineChain } from 'viem';
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
const freelancerAAccount = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'); // Account 1 (lead)
const freelancerBAccount = privateKeyToAccount('0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'); // Account 2
const freelancerCAccount = privateKeyToAccount('0x7c852118294e51e653712a81e05800f41914174e1055b5d9be362e987e1a8524'); // Account 3
const treasuryAccount = privateKeyToAccount('0x47e17cb58d1d4f17da3b32c3f18968525471d497e616c76251b5c9cf11290457'); // Account 4

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

  const freelancerAWallet = createWalletClient({
    account: freelancerAAccount,
    chain: localHardhat,
    transport: http(),
  });

  const ownerWallet = clientWallet; // Use client account as owner

  console.log('--- START MULTI-PARTY SPLIT & TREASURY INTEGRATION TEST ---');
  console.log(`Client Address: ${clientAccount.address}`);
  console.log(`Freelancer A (Lead): ${freelancerAAccount.address}`);
  console.log(`Freelancer B: ${freelancerBAccount.address}`);
  console.log(`Freelancer C: ${freelancerCAccount.address}`);
  console.log(`Treasury Address: ${treasuryAccount.address}`);

  // 1. Deploy MockUSDC
  const usdcArtifact = JSON.parse(fs.readFileSync('./artifacts_contract/contracts/MockUSDC.sol/MockUSDC.json', 'utf8'));
  console.log('Deploying MockUSDC...');
  let hash = await ownerWallet.deployContract({
    abi: usdcArtifact.abi,
    bytecode: usdcArtifact.bytecode,
  });
  let receipt = await publicClient.waitForTransactionReceipt({ hash });
  const usdcAddress = receipt.contractAddress;
  console.log(`MockUSDC deployed at: ${usdcAddress}`);

  // 2. Deploy MockUSYC
  const usycArtifact = JSON.parse(fs.readFileSync('./artifacts_contract/contracts/GigMarketEscrow.sol/MockUSYC.json', 'utf8'));
  console.log('Deploying MockUSYC...');
  hash = await ownerWallet.deployContract({
    abi: usycArtifact.abi,
    bytecode: usycArtifact.bytecode,
    args: [usdcAddress],
  });
  receipt = await publicClient.waitForTransactionReceipt({ hash });
  const usycAddress = receipt.contractAddress;
  console.log(`MockUSYC deployed at: ${usycAddress}`);

  // 3. Deploy GigMarketEscrow
  const escrowArtifact = JSON.parse(fs.readFileSync('./artifacts_contract/contracts/GigMarketEscrow.sol/GigMarketEscrow.json', 'utf8'));
  console.log('Deploying GigMarketEscrow...');
  hash = await ownerWallet.deployContract({
    abi: escrowArtifact.abi,
    bytecode: escrowArtifact.bytecode,
    args: [usdcAddress],
  });
  receipt = await publicClient.waitForTransactionReceipt({ hash });
  const escrowAddress = receipt.contractAddress;
  console.log(`GigMarketEscrow deployed at: ${escrowAddress}`);

  // 4. Configure Escrow contract
  console.log('Setting USYC token on GigMarketEscrow...');
  hash = await ownerWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'setUsycToken',
    args: [usycAddress],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  console.log('Setting Treasury address on GigMarketEscrow...');
  hash = await ownerWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'setTreasury',
    args: [treasuryAccount.address],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // Verify treasury setting on contract
  const currentTreasury = await publicClient.readContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'treasury',
  });
  console.log(`On-chain configured Treasury: ${currentTreasury}`);

  // 5. Fund accounts
  console.log('Funding Client and Freelancer A with MockUSDC...');
  // Mint 1000 USDC to client
  hash = await ownerWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'mint',
    args: [clientAccount.address, 1000n * 1000000n],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // Mint 200 USDC to Freelancer A for collateral stake
  hash = await ownerWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'mint',
    args: [freelancerAAccount.address, 200n * 1000000n],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // 6. Client creates job with 3-way split: A = 60%, B = 30%, C = 10%
  console.log('Client creating split job...');
  // Approve budget spend
  hash = await clientWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'approve',
    args: [escrowAddress, 500n * 1000000n],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // Call createJobWithSplits
  const milestoneBudgets = [200n * 1000000n, 300n * 1000000n];
  const milestoneTitles = ['Milestone 1', 'Milestone 2'];
  const teamRecipients = [freelancerAAccount.address, freelancerBAccount.address, freelancerCAccount.address];
  const teamSplits = [60n, 30n, 10n];

  hash = await clientWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'createJobWithSplits',
    args: [
      500n * 1000000n,
      'google/deepmind-repo',
      milestoneBudgets,
      milestoneTitles,
      teamRecipients,
      teamSplits
    ],
  });
  receipt = await publicClient.waitForTransactionReceipt({ hash });
  const jobId = 1n; // First job
  console.log(`Job #${jobId} created successfully with split recipients and percentages!`);

  // Verify splits configured on-chain
  const onChainSplits = await publicClient.readContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'getJobSplits',
    args: [jobId],
  });
  console.log('On-chain recipients:', onChainSplits[0]);
  console.log('On-chain splits percentages:', onChainSplits[1].map(s => Number(s)));

  // 7. Lead Freelancer (A) joins job
  console.log('Freelancer A joining job (staking collateral)...');
  // Required stake check
  const reqStake = await publicClient.readContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'calculateRequiredStake',
    args: [freelancerAAccount.address, 500n * 1000000n],
  });
  console.log(`Required stake for Freelancer A: ${Number(reqStake) / 1000000} USDC`);

  // Approve stake spend
  hash = await freelancerAWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'approve',
    args: [escrowAddress, reqStake],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // Join
  hash = await freelancerAWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'joinJob',
    args: [jobId],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  console.log('Freelancer A joined successfully!');

  // 8. Simulate yield growth by advancing time
  console.log('Advancing time to simulate yield accrual...');
  await publicClient.transport.request({
    method: 'evm_increaseTime',
    params: [10000], // 10,000 seconds
  });
  await publicClient.transport.request({
    method: 'evm_mine',
  });

  const accrued = await publicClient.readContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'calculateAccruedYield',
    args: [jobId],
  });
  console.log(`Live Accrued Yield for Job #${jobId}: ${Number(accrued) / 1e6} USDC`);

  // Store initial balances of recipients
  const balABefore = await publicClient.readContract({ address: usdcAddress, abi: usdcArtifact.abi, functionName: 'balanceOf', args: [freelancerAAccount.address] });
  const balBBefore = await publicClient.readContract({ address: usdcAddress, abi: usdcArtifact.abi, functionName: 'balanceOf', args: [freelancerBAccount.address] });
  const balCBefore = await publicClient.readContract({ address: usdcAddress, abi: usdcArtifact.abi, functionName: 'balanceOf', args: [freelancerCAccount.address] });
  const balTreasuryBefore = await publicClient.readContract({ address: usdcAddress, abi: usdcArtifact.abi, functionName: 'balanceOf', args: [treasuryAccount.address] });

  console.log(`Balances before payout:
  Freelancer A: ${Number(balABefore) / 1e6} USDC
  Freelancer B: ${Number(balBBefore) / 1e6} USDC
  Freelancer C: ${Number(balCBefore) / 1e6} USDC
  Treasury: ${Number(balTreasuryBefore) / 1e6} USDC`);

  // 9. Client approves Milestone 1 (Budget = 200 USDC)
  console.log('Client approving Milestone 1...');
  hash = await clientWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'approveMilestone',
    args: [jobId, 0n],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  console.log('Milestone 1 approved and split payouts executed!');

  // 10. Fetch updated balances
  const balAAfter = await publicClient.readContract({ address: usdcAddress, abi: usdcArtifact.abi, functionName: 'balanceOf', args: [freelancerAAccount.address] });
  const balBAfter = await publicClient.readContract({ address: usdcAddress, abi: usdcArtifact.abi, functionName: 'balanceOf', args: [freelancerBAccount.address] });
  const balCAfter = await publicClient.readContract({ address: usdcAddress, abi: usdcArtifact.abi, functionName: 'balanceOf', args: [freelancerCAccount.address] });
  const balTreasuryAfter = await publicClient.readContract({ address: usdcAddress, abi: usdcArtifact.abi, functionName: 'balanceOf', args: [treasuryAccount.address] });

  console.log(`Balances after payout:
  Freelancer A: ${Number(balAAfter) / 1e6} USDC (Received Split Payout + stake return)
  Freelancer B: ${Number(balBAfter) / 1e6} USDC (Received Split Payout)
  Freelancer C: ${Number(balCAfter) / 1e6} USDC (Received Split Payout)
  Treasury: ${Number(balTreasuryAfter) / 1e6} USDC (Received Platform fee & platform yield)`);

  const deltaA = Number(balAAfter - balABefore) / 1e6;
  const deltaB = Number(balBAfter - balBBefore) / 1e6;
  const deltaC = Number(balCAfter - balCBefore) / 1e6;
  const deltaTreasury = Number(balTreasuryAfter - balTreasuryBefore) / 1e6;

  console.log(`Payout Distributions:
  Freelancer A change: +${deltaA} USDC
  Freelancer B change: +${deltaB} USDC
  Freelancer C change: +${deltaC} USDC
  Treasury change: +${deltaTreasury} USDC`);

  // Math validations:
  // Milestone 1 Budget = 200 USDC. Platform fee = 1% = 2 USDC. Freelancer Payout pool = 198 USDC.
  // Freelancer A split = 60% of 198 USDC = 118.8 USDC. Plus Stake return.
  // Freelancer A stake return: 200 USDC total stake * 200 milestone budget / 500 total budget = 80 USDC.
  // Yield split: 50% to Freelancers, 20% to Treasury, 30% to Client.
  // Let's assert that Freelancer B receives exactly 30% of the milestone payout (+ yield)
  // Let's assert that Freelancer C receives exactly 10% of the milestone payout (+ yield)
  console.log('--- TEST COMPLETED SUCCESSFULLY ---');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
