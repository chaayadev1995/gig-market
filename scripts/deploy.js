import { createWalletClient, createPublicClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { initiateSmartContractPlatformClient } from '@circle-fin/smart-contract-platform';
import { CircleDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

dotenv.config();

// Arc Testnet chain definition
const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: {
    decimals: 18, // Native gas token has 18 decimals on Arc
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
  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: 'https://testnet.arcscan.app',
    },
  },
});

const USDC_TOKEN_ADDRESS = '0x3600000000000000000000000000000000000000';

async function deployContractViaScp(name, abi, bytecode, constructorParameters = []) {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  const walletId = process.env.CIRCLE_WALLET_ID;
  
  const scpClient = initiateSmartContractPlatformClient({
    apiKey,
    entitySecret,
  });

  console.log(`[SCP Deploy] Deploying ${name} on ARC-TESTNET using wallet: ${walletId}...`);
  const response = await scpClient.deployContract({
    name,
    description: `GigMarket contract ${name}`,
    blockchain: 'ARC-TESTNET',
    walletId,
    abiJson: JSON.stringify(abi),
    bytecode,
    constructorParameters,
    fee: {
      type: 'level',
      config: {
        feeLevel: 'MEDIUM',
      },
    },
  });

  const contractId = response.data.contractId;
  console.log(`[SCP Deploy] Contract deployment initiated. ID: ${contractId}`);

  // Poll for completion
  while (true) {
    const getRes = await scpClient.getContract({ id: contractId });
    const contract = getRes.data.contract;
    console.log(`[SCP Deploy] Polling status for ${name}: ${contract.status}`);
    if (contract.status === 'COMPLETE') {
      console.log(`[SCP Deploy] Successfully deployed ${name} to address: ${contract.contractAddress}`);
      return contract.contractAddress;
    }
    if (contract.status === 'FAILED') {
      throw new Error(`Deployment failed: ${contract.deploymentErrorReason || 'Unknown error'} - ${contract.deploymentErrorDetails || ''}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

async function executeWriteViaDcw(contractAddress, abiFunctionSignature, abiParameters) {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  const walletId = process.env.CIRCLE_WALLET_ID;
  
  const dcwClient = new CircleDeveloperControlledWalletsClient({
    apiKey,
    entitySecret,
  });

  const idempotencyKey = crypto.randomUUID();
  console.log(`[DCW Write] Executing ${abiFunctionSignature} with params:`, abiParameters);
  
  const response = await dcwClient.createContractExecutionTransaction({
    walletId,
    contractAddress,
    abiFunctionSignature,
    abiParameters,
    feeLevel: 'MEDIUM',
    idempotencyKey,
  });

  console.log(`[DCW Write] Transaction response ID: ${response.id}`);
  
  // Wait for state SENT to get txHash
  const txRes = await dcwClient.getTransaction({
    id: response.id,
    waitForState: 'SENT'
  });
  const txHash = txRes.data?.transaction?.txHash;
  console.log(`[DCW Write] Mined transaction hash: ${txHash}`);
  return txHash;
}

async function registerEventMonitors(contractAddress) {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
  
  const scpClient = initiateSmartContractPlatformClient({
    apiKey,
    entitySecret,
  });

  const events = [
    'JobCreated(uint256,address,uint256,string)',
    'JobJoined(uint256,address,uint256)'
  ];

  for (const sig of events) {
    try {
      console.log(`[SCP Monitor] Registering event monitor for: ${sig} on ${contractAddress}...`);
      await scpClient.createEventMonitor({
        blockchain: 'ARC-TESTNET',
        contractAddress,
        eventSignature: sig,
        idempotencyKey: crypto.randomUUID()
      });
      console.log(`[SCP Monitor] Registered successfully.`);
    } catch (e) {
      console.warn(`[SCP Monitor] Registration skipped or failed (might already exist):`, e.message);
    }
  }
}

async function main() {
  const circleConfigured =
    process.env.CIRCLE_API_KEY &&
    !process.env.CIRCLE_API_KEY.startsWith('TEST_API_KEY') &&
    process.env.CIRCLE_WALLET_ID &&
    process.env.CIRCLE_WALLET_ID !== 'your-circle-wallet-id-here';

  console.log(`Starting deployment... Circle SCP/DCW Configured: ${circleConfigured}`);

  // Load contract artifacts
  const mockUsycArtifactPath = path.resolve('./artifacts_contract/contracts/MockUSYC.sol/MockUSYC.json');
  const agentRegistryArtifactPath = path.resolve('./artifacts_contract/contracts/AgentRegistry.sol/AgentRegistry.json');
  const agentEscrow8183ArtifactPath = path.resolve('./artifacts_contract/contracts/AgentEscrow8183.sol/AgentEscrow8183.json');
  const gigMarketEscrowArtifactPath = path.resolve('./artifacts_contract/contracts/GigMarketEscrow.sol/GigMarketEscrow.json');

  if (!fs.existsSync(mockUsycArtifactPath) || 
      !fs.existsSync(agentRegistryArtifactPath) || 
      !fs.existsSync(agentEscrow8183ArtifactPath) || 
      !fs.existsSync(gigMarketEscrowArtifactPath)) {
    console.error('ERROR: Compiled JSON artifacts not found. Please run "npm run compile" first.');
    process.exit(1);
  }

  const mockUsycJson = JSON.parse(fs.readFileSync(mockUsycArtifactPath, 'utf8'));
  const agentRegistryJson = JSON.parse(fs.readFileSync(agentRegistryArtifactPath, 'utf8'));
  const agentEscrow8183Json = JSON.parse(fs.readFileSync(agentEscrow8183ArtifactPath, 'utf8'));
  const gigMarketEscrowJson = JSON.parse(fs.readFileSync(gigMarketEscrowArtifactPath, 'utf8'));

  let mockUsycAddress, agentRegistryAddress, gigMarketEscrowAddress, agentEscrow8183Address;

  if (circleConfigured) {
    try {
      // 1. Deploy MockUSYC via SCP
      mockUsycAddress = await deployContractViaScp('MockUSYC', mockUsycJson.abi, mockUsycJson.bytecode, [USDC_TOKEN_ADDRESS]);

      // 2. Deploy AgentRegistry via SCP
      agentRegistryAddress = await deployContractViaScp('AgentRegistry', agentRegistryJson.abi, agentRegistryJson.bytecode, []);

      // 3. Deploy GigMarketEscrow via SCP
      gigMarketEscrowAddress = await deployContractViaScp('GigMarketEscrow', gigMarketEscrowJson.abi, gigMarketEscrowJson.bytecode, [USDC_TOKEN_ADDRESS]);

      // 4. Configure GigMarketEscrow setup parameters via DCW writes
      console.log('Setting USYC token address on GigMarketEscrow...');
      await executeWriteViaDcw(gigMarketEscrowAddress, 'setUsycToken(address)', [mockUsycAddress]);

      console.log('Setting AgentRegistry address on GigMarketEscrow...');
      await executeWriteViaDcw(gigMarketEscrowAddress, 'setAgentRegistry(address)', [agentRegistryAddress]);

      // Get DCW wallet address to set as fallback treasury address
      const dcwClient = new CircleDeveloperControlledWalletsClient({
        apiKey: process.env.CIRCLE_API_KEY,
        entitySecret: process.env.CIRCLE_ENTITY_SECRET,
      });
      const walletRes = await dcwClient.getWallet({ id: process.env.CIRCLE_WALLET_ID });
      const walletAddress = walletRes.data?.wallet?.address;
      
      const platformTreasury = process.env.TREASURY_ADDRESS || walletAddress;
      console.log(`Setting treasury address on GigMarketEscrow to: ${platformTreasury}...`);
      await executeWriteViaDcw(gigMarketEscrowAddress, 'setTreasury(address)', [platformTreasury]);

      // 5. Deploy AgentEscrow8183 via SCP
      agentEscrow8183Address = await deployContractViaScp('AgentEscrow8183', agentEscrow8183Json.abi, agentEscrow8183Json.bytecode, []);

      // 6. Register SCP Event Monitors
      console.log('Registering SCP Event Monitors for GigMarketEscrow...');
      await registerEventMonitors(gigMarketEscrowAddress);

    } catch (error) {
      console.error('Circle SCP/DCW Deployment failed:', error);
      process.exit(1);
    }
  } else {
    // Local Viem private key deployment fallback
    console.log('Falling back to local private key deployment via Viem...');
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error('ERROR: PRIVATE_KEY environment variable is not defined in .env');
      process.exit(1);
    }

    const account = privateKeyToAccount(privateKey);
    console.log(`Deployer address: ${account.address}`);

    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http(),
    });

    const walletClient = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http(),
    });

    try {
      console.log('Deploying MockUSYC contract on Arc Testnet...');
      const usycHash = await walletClient.deployContract({
        abi: mockUsycJson.abi,
        bytecode: mockUsycJson.bytecode,
        args: [USDC_TOKEN_ADDRESS],
      });
      console.log(`MockUSYC Transaction hash: ${usycHash}`);
      const usycReceipt = await publicClient.waitForTransactionReceipt({ hash: usycHash });
      mockUsycAddress = usycReceipt.contractAddress;
      console.log(`SUCCESS: MockUSYC deployed to: ${mockUsycAddress}`);

      console.log('Deploying AgentRegistry contract on Arc Testnet...');
      const agentRegHash = await walletClient.deployContract({
        abi: agentRegistryJson.abi,
        bytecode: agentRegistryJson.bytecode,
      });
      console.log(`AgentRegistry Transaction hash: ${agentRegHash}`);
      const agentRegReceipt = await publicClient.waitForTransactionReceipt({ hash: agentRegHash });
      agentRegistryAddress = agentRegReceipt.contractAddress;
      console.log(`SUCCESS: AgentRegistry deployed to: ${agentRegistryAddress}`);

      console.log('Deploying GigMarketEscrow contract on Arc Testnet...');
      const hash = await walletClient.deployContract({
        abi: gigMarketEscrowJson.abi,
        bytecode: gigMarketEscrowJson.bytecode,
        args: [USDC_TOKEN_ADDRESS],
      });
      console.log(`Transaction hash: ${hash}`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      gigMarketEscrowAddress = receipt.contractAddress;
      console.log(`SUCCESS: GigMarketEscrow deployed to: ${gigMarketEscrowAddress}`);

      console.log('Setting USYC token address on GigMarketEscrow...');
      const setUsycHash = await walletClient.writeContract({
        address: gigMarketEscrowAddress,
        abi: gigMarketEscrowJson.abi,
        functionName: 'setUsycToken',
        args: [mockUsycAddress],
      });
      await publicClient.waitForTransactionReceipt({ hash: setUsycHash });

      console.log('Setting AgentRegistry address on GigMarketEscrow...');
      const setAgentRegHash = await walletClient.writeContract({
        address: gigMarketEscrowAddress,
        abi: gigMarketEscrowJson.abi,
        functionName: 'setAgentRegistry',
        args: [agentRegistryAddress],
      });
      await publicClient.waitForTransactionReceipt({ hash: setAgentRegHash });

      const platformTreasury = process.env.TREASURY_ADDRESS || account.address;
      console.log(`Setting treasury address on GigMarketEscrow to: ${platformTreasury}...`);
      const setTreasuryHash = await walletClient.writeContract({
        address: gigMarketEscrowAddress,
        abi: gigMarketEscrowJson.abi,
        functionName: 'setTreasury',
        args: [platformTreasury],
      });
      await publicClient.waitForTransactionReceipt({ hash: setTreasuryHash });
      
      console.log('Deploying AgentEscrow8183 contract on Arc Testnet...');
      const escrow8183Hash = await walletClient.deployContract({
        abi: agentEscrow8183Json.abi,
        bytecode: agentEscrow8183Json.bytecode,
      });
      const escrow8183Receipt = await publicClient.waitForTransactionReceipt({ hash: escrow8183Hash });
      agentEscrow8183Address = escrow8183Receipt.contractAddress;
      console.log(`SUCCESS: AgentEscrow8183 deployed to: ${agentEscrow8183Address}`);

    } catch (error) {
      console.error('Local Deployment failed:', error);
      process.exit(1);
    }
  }

  // Save contract address to a JSON file so that backend and frontend can read it
  const addressesDir = './db';
  if (!fs.existsSync(addressesDir)) {
    fs.mkdirSync(addressesDir);
  }
  fs.writeFileSync(
    path.join(addressesDir, 'contract-address.json'),
    JSON.stringify({ 
      GigMarketEscrow: gigMarketEscrowAddress, 
      MockUSYC: mockUsycAddress, 
      AgentRegistry: agentRegistryAddress,
      AgentEscrow8183: agentEscrow8183Address
    }, null, 2)
  );
  console.log('Saved contract addresses to db/contract-address.json');
}

main();
