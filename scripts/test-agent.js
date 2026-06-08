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
const clientAccount = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'); // Account 0 (Owner of Agent/Client)
const agentAccount = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'); // Account 1 (AI Agent Bot)
const rogueAccount = privateKeyToAccount('0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'); // Account 2 (Unregistered Freelancer)

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

  const rogueWallet = createWalletClient({
    account: rogueAccount,
    chain: localHardhat,
    transport: http(),
  });

  const ownerWallet = clientWallet;

  console.log('--- START AUTONOMOUS AI AGENT REGISTRATION & ESCROW GATING TEST ---');
  console.log(`Agent Owner Address: ${clientAccount.address}`);
  console.log(`AI Agent Address: ${agentAccount.address}`);
  console.log(`Rogue (Unregistered) Address: ${rogueAccount.address}`);

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

  // Mint USDC to client and agent for transaction budgeting
  console.log('Minting MockUSDC to client and agent...');
  hash = await ownerWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'mint',
    args: [clientAccount.address, 1000n * 1000000n],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  hash = await ownerWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'mint',
    args: [agentAccount.address, 100n * 1000000n],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  console.log('USDC minted successfully.');

  // 2. Deploy AgentRegistry
  const registryArtifact = JSON.parse(fs.readFileSync('./artifacts_contract/contracts/AgentRegistry.sol/AgentRegistry.json', 'utf8'));
  console.log('Deploying AgentRegistry...');
  hash = await ownerWallet.deployContract({
    abi: registryArtifact.abi,
    bytecode: registryArtifact.bytecode,
  });
  receipt = await publicClient.waitForTransactionReceipt({ hash });
  const registryAddress = receipt.contractAddress;
  console.log(`AgentRegistry deployed at: ${registryAddress}`);

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

  // 4. Configure Escrow contract with AgentRegistry address
  console.log('Linking AgentRegistry on GigMarketEscrow...');
  hash = await ownerWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'setAgentRegistry',
    args: [registryAddress],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  console.log('AgentRegistry successfully linked on escrow!');

  // 5. Generate Cryptographic Signature from Agent's Private Key
  console.log('Generating Agent Signature for registration...');
  const agentURI = 'https://agents.gigmarket.dev/meta/gpt-coding-assistant.json';
  
  // Recreate the message hash: keccak256(abi.encodePacked(msg.sender, agentURI, agentAddress))
  const messageHash = keccak256(
    encodePacked(
      ['address', 'string', 'address'],
      [clientAccount.address, agentURI, agentAccount.address]
    )
  );

  // Sign the hash (standard Ethereum Signed Message signature)
  const agentSignature = await agentWallet.signMessage({
    message: { raw: messageHash }
  });
  console.log(`Generated Agent Signature: ${agentSignature}`);

  // 6. Owner registers the AI Agent in the AgentRegistry using the signature
  console.log('Owner registering AI Agent in registry...');
  hash = await clientWallet.writeContract({
    address: registryAddress,
    abi: registryArtifact.abi,
    functionName: 'registerAgent',
    args: [agentAccount.address, agentURI, agentSignature],
  });
  receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log('AI Agent registered successfully in registry contract!');

  // Verify registration status on-chain
  const isAgent = await publicClient.readContract({
    address: registryAddress,
    abi: registryArtifact.abi,
    functionName: 'isRegisteredAgent',
    args: [agentAccount.address],
  });
  console.log(`Is registered agent verified on-chain: ${isAgent}`);

  // 7. Test Escrow Gating: Create a Gig
  console.log('Client creating a new Gig...');
  // Approve budget spend
  hash = await clientWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'approve',
    args: [escrowAddress, 100n * 1000000n],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  const milestoneBudgets = [100n * 1000000n];
  const milestoneTitles = ['Code Review'];
  hash = await clientWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'createJob',
    args: [100n * 1000000n, 'google/agent-pr', milestoneBudgets, milestoneTitles],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  const jobId = 1n;
  console.log(`Job #${jobId} created!`);

  // Rogue unregistered user tries to join - should revert!
  console.log('Simulating rogue freelancer trying to join job...');
  try {
    hash = await rogueWallet.writeContract({
      address: escrowAddress,
      abi: escrowArtifact.abi,
      functionName: 'joinJob',
      args: [jobId],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    console.error('ERROR: Unregistered address joined a gated job!');
    process.exit(1);
  } catch (error) {
    console.log('SUCCESS: Rogue join reverted as expected:', error.message.substring(0, 120));
  }

  // Registered Agent approves the escrow contract for the required collateral stake
  console.log('AI Agent approving USDC for collateral stake...');
  hash = await agentWallet.writeContract({
    address: usdcAddress,
    abi: usdcArtifact.abi,
    functionName: 'approve',
    args: [escrowAddress, 10n * 1000000n], // 10% of 100 USDC is 10 USDC required stake
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // Registered Agent tries to join - should succeed!
  console.log('Simulating registered AI Agent joining job...');
  hash = await agentWallet.writeContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'joinJob',
    args: [jobId],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  console.log('SUCCESS: Registered AI Agent successfully joined the job!');

  // Verify status of job
  const jobInfo = await publicClient.readContract({
    address: escrowAddress,
    abi: escrowArtifact.abi,
    functionName: 'jobs',
    args: [jobId],
  });
  console.log(`Job freelancer: ${jobInfo[2]}`);
  console.log(`Job status code (1 = Active): ${jobInfo[6]}`);

  console.log('--- ALL AGENT IDENTITY GATING TESTS COMPLETED SUCCESSFULLY ---');
}

main().catch(e => {
  console.error("ERROR MESSAGE:", e.message || e);
  if (e.shortMessage) console.error("SHORT MESSAGE:", e.shortMessage);
  process.exit(1);
});
