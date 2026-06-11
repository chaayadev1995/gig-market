import { createWalletClient, createPublicClient, http, defineChain, parseUnits } from 'viem';
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
      throw new Error(`Deployment failed: ${contract.deploymentErrorReason || 'Unknown error'}`);
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
  console.log(`[DCW Write] Executing ${abiFunctionSignature} on ${contractAddress} with params:`, abiParameters);
  
  const response = await dcwClient.createContractExecutionTransaction({
    walletId,
    contractAddress,
    abiFunctionSignature,
    abiParameters,
    feeLevel: 'MEDIUM',
    idempotencyKey,
  });

  console.log(`[DCW Write] Transaction response ID: ${response.id}`);
  const txRes = await dcwClient.getTransaction({
    id: response.id,
    waitForState: 'SENT'
  });
  const txHash = txRes.data?.transaction?.txHash;
  console.log(`[DCW Write] Mined transaction hash: ${txHash}`);
  return txHash;
}

async function main() {
  const circleConfigured =
    process.env.CIRCLE_API_KEY &&
    !process.env.CIRCLE_API_KEY.startsWith('TEST_API_KEY') &&
    process.env.CIRCLE_WALLET_ID &&
    process.env.CIRCLE_WALLET_ID !== 'your-circle-wallet-id-here';

  console.log(`Starting StableFX deployment... Circle SCP/DCW Configured: ${circleConfigured}`);

  const mockEurcArtifactPath = path.resolve('./artifacts_contract/contracts/MockEURC.sol/MockEURC.json');
  const mockRouterArtifactPath = path.resolve('./artifacts_contract/contracts/MockStableFXRouter.sol/MockStableFXRouter.json');

  if (!fs.existsSync(mockEurcArtifactPath) || !fs.existsSync(mockRouterArtifactPath)) {
    console.error('ERROR: Compiled JSON artifacts not found. Please run "npm run compile" first.');
    process.exit(1);
  }

  const mockEurcJson = JSON.parse(fs.readFileSync(mockEurcArtifactPath, 'utf8'));
  const mockRouterJson = JSON.parse(fs.readFileSync(mockRouterArtifactPath, 'utf8'));

  // Load existing addresses to get GigMarketEscrow address
  const addressesPath = path.resolve('./db/contract-address.json');
  if (!fs.existsSync(addressesPath)) {
    console.error('ERROR: db/contract-address.json not found. Deploy GigMarketEscrow first.');
    process.exit(1);
  }
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  const gigMarketEscrowAddress = addresses.GigMarketEscrow;
  console.log(`Existing GigMarketEscrow address: ${gigMarketEscrowAddress}`);

  let mockEurcAddress, mockRouterAddress;

  if (circleConfigured) {
    try {
      // 1. Deploy MockEURC via SCP
      mockEurcAddress = await deployContractViaScp('MockEURC', mockEurcJson.abi, mockEurcJson.bytecode, []);

      // 2. Deploy MockStableFXRouter via SCP
      mockRouterAddress = await deployContractViaScp('MockStableFXRouter', mockRouterJson.abi, mockRouterJson.bytecode, []);

      // 3. Set stableFXRouter on GigMarketEscrow via DCW
      console.log('Configuring stableFXRouter on GigMarketEscrow...');
      await executeWriteViaDcw(gigMarketEscrowAddress, 'setStableFX(address,address)', [mockRouterAddress, mockEurcAddress]);

      // 4. Mint MockEURC to MockStableFXRouter via DCW (1,000,000 tokens with 6 decimals)
      const mintAmount = parseUnits('1000000', 6).toString();
      console.log(`Minting ${mintAmount} units of MockEURC to MockStableFXRouter...`);
      await executeWriteViaDcw(mockEurcAddress, 'mint(address,uint256)', [mockRouterAddress, mintAmount]);

    } catch (error) {
      console.error('Circle SCP/DCW StableFX Deployment failed:', error);
      process.exit(1);
    }
  } else {
    // Local fallback private key deployment via Viem
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
      console.log('Deploying MockEURC contract on Arc Testnet...');
      const eurcHash = await walletClient.deployContract({
        abi: mockEurcJson.abi,
        bytecode: mockEurcJson.bytecode,
      });
      console.log(`MockEURC Transaction hash: ${eurcHash}`);
      const eurcReceipt = await publicClient.waitForTransactionReceipt({ hash: eurcHash });
      mockEurcAddress = eurcReceipt.contractAddress;
      console.log(`SUCCESS: MockEURC deployed to: ${mockEurcAddress}`);

      console.log('Deploying MockStableFXRouter contract on Arc Testnet...');
      const routerHash = await walletClient.deployContract({
        abi: mockRouterJson.abi,
        bytecode: mockRouterJson.bytecode,
      });
      console.log(`MockStableFXRouter Transaction hash: ${routerHash}`);
      const routerReceipt = await publicClient.waitForTransactionReceipt({ hash: routerHash });
      mockRouterAddress = routerReceipt.contractAddress;
      console.log(`SUCCESS: MockStableFXRouter deployed to: ${mockRouterAddress}`);

      console.log('Configuring stableFXRouter on GigMarketEscrow...');
      const setStableHash = await walletClient.writeContract({
        address: gigMarketEscrowAddress,
        abi: [
          {
            name: 'setStableFX',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: '_router', type: 'address' },
              { name: '_eurcToken', type: 'address' }
            ],
            outputs: []
          }
        ],
        functionName: 'setStableFX',
        args: [mockRouterAddress, mockEurcAddress],
      });
      await publicClient.waitForTransactionReceipt({ hash: setStableHash });
      console.log('SUCCESS: Configured stableFXRouter on GigMarketEscrow.');

      const mintAmount = parseUnits('1000000', 6);
      console.log(`Minting MockEURC to MockStableFXRouter...`);
      const mintHash = await walletClient.writeContract({
        address: mockEurcAddress,
        abi: mockEurcJson.abi,
        functionName: 'mint',
        args: [mockRouterAddress, mintAmount],
      });
      await publicClient.waitForTransactionReceipt({ hash: mintHash });
      console.log('SUCCESS: Minted MockEURC to MockStableFXRouter.');

    } catch (error) {
      console.error('Local Deployment failed:', error);
      process.exit(1);
    }
  }

  // Update contract-address.json
  addresses.MockEURC = mockEurcAddress;
  addresses.MockStableFXRouter = mockRouterAddress;
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log(`Updated db/contract-address.json with MockEURC and MockStableFXRouter addresses.`);
}

main();
