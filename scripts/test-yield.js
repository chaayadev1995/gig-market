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
const clientAccount = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
const freelancerAccount = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
const ownerAccount = clientAccount; // Use pre-funded client account as contract owner

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

  const freelancerWallet = createWalletClient({
    account: freelancerAccount,
    chain: localHardhat,
    transport: http(),
  });

  const ownerWallet = createWalletClient({
    account: ownerAccount,
    chain: localHardhat,
    transport: http(),
  });

  console.log('--- START YIELD ESCROW INTEGRATION TEST ---');
  console.log(`Client Address: ${clientAccount.address}`);
  console.log(`Freelancer Address: ${freelancerAccount.address}`);
  console.log(`Owner Address: ${ownerAccount.address}`);

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

  console.log('Setting USYC token on GigMarketEscrow...');
  hash = await ownerWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'setUsycToken',
    args: [usycAddress],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // 4. Mint MockUSDC to Client and Freelancer
  console.log('Minting MockUSDC to Client and Freelancer...');
  // Mint 10,000 USDC to Client (USDC has 6 decimals, so 10,000 * 10^6 = 10_000_000_000)
  hash = await ownerWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'mint',
    args: [clientAccount.address, 10000000000n],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // Mint 5,000 USDC to Freelancer
  hash = await ownerWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'mint',
    args: [freelancerAccount.address, 5000000000n],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // 5. Client approves Escrow to spend USDC and creates a job
  console.log('Client creating job...');
  // Approve 100 USDC (100 * 10^6 = 100_000_000)
  hash = await clientWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'approve',
    args: [escrowAddress, 100000000n],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // Create job: budget 100 USDC, 2 milestones (50 USDC each)
  hash = await clientWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'createJob',
    args: [
      100000000n,
      'test-repo',
      [50000000n, 50000000n],
      ['Milestone 1', 'Milestone 2']
    ],
  });
  receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log('Job #1 created successfully!');

  // Check job details
  let job = await publicClient.readContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'jobs',
    args: [1n],
  });
  console.log(`On-chain Job Budget: ${Number(job[3]) / 1e6} USDC`);

  // Check USYC shares minted for this job
  let jobShares = await publicClient.readContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'jobUsycShares',
    args: [1n],
  });
  console.log(`USYC Shares minted for Job #1: ${Number(jobShares) / 1e6} shares`);

  // 6. Freelancer joins the job
  console.log('Freelancer joining job (staking collateral)...');
  // Required stake for 100 USDC job budget is 10% = 10 USDC (10 * 10^6 = 10_000_000)
  hash = await freelancerWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'approve',
    args: [escrowAddress, 10000000n],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  hash = await freelancerWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'joinJob',
    args: [1n],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  console.log('Freelancer successfully joined the job!');

  jobShares = await publicClient.readContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'jobUsycShares',
    args: [1n],
  });
  console.log(`Total USYC Shares for Job #1 (Client budget + Freelancer stake): ${Number(jobShares) / 1e6} shares`);

  // 7. Simulate Yield growth
  console.log('Simulating yield growth by advancing time...');
  // We mint 50 USDC of mock USDC directly to MockUSYC contract so that it has the actual funds to back the accrued yield when redeemed.
  hash = await ownerWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'mint',
    args: [usycAddress, 50000000n],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // Advance time by 10,000 seconds on the Hardhat local node
  await publicClient.request({
    method: 'evm_increaseTime',
    params: [10000],
  });
  await publicClient.request({
    method: 'evm_mine',
  });
  console.log('Successfully advanced blockchain time by 10,000 seconds (~10% yield)!');

  // Calculate live accrued yield
  let liveYield = await publicClient.readContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'calculateAccruedYield',
    args: [1n],
  });
  console.log(`Live Accrued Yield for Job #1: ${Number(liveYield) / 1e6} USDC`);

  // 8. Approve Milestone 1 and distribute yield
  console.log('Approving Milestone 1...');
  const freelancerBalanceBefore = await publicClient.readContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'balanceOf',
    args: [freelancerAccount.address],
  });
  const clientBalanceBefore = await publicClient.readContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'balanceOf',
    args: [clientAccount.address],
  });

  hash = await clientWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'approveMilestone',
    args: [1n, 0n],
  });
  receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log('Milestone 1 approved!');

  const freelancerBalanceAfter = await publicClient.readContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'balanceOf',
    args: [freelancerAccount.address],
  });
  const clientBalanceAfter = await publicClient.readContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'balanceOf',
    args: [clientAccount.address],
  });

  const freelancerReceived = Number(freelancerBalanceAfter - freelancerBalanceBefore) / 1e6;
  const clientReceived = Number(clientBalanceAfter - clientBalanceBefore) / 1e6;

  console.log(`Freelancer USDC Received: ${freelancerReceived} USDC`);
  console.log(`Client USDC Received (Yield Cash-back): ${clientReceived} USDC`);

  // Check updated job states
  job = await publicClient.readContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'jobs',
    args: [1n],
  });
  console.log(`Accumulated Yield recorded on-chain: ${Number(job[11]) / 1e6} USDC`);
  console.log(`Yield Distributed recorded on-chain: ${Number(job[12]) / 1e6} USDC`);

  console.log('--- TEST COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
