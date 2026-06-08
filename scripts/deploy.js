import { createWalletClient, createPublicClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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

async function main() {
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

  // Read compiled contract artifact for MockUSYC
  const mockUsycArtifactPath = path.resolve('./artifacts_contract/contracts/MockUSYC.sol/MockUSYC.json');
  if (!fs.existsSync(mockUsycArtifactPath)) {
    console.error('ERROR: MockUSYC JSON artifact not found. Please run "npm run compile" first.');
    process.exit(1);
  }

  const mockUsycJson = JSON.parse(fs.readFileSync(mockUsycArtifactPath, 'utf8'));
  const mockUsycAbi = mockUsycJson.abi;
  const mockUsycBytecode = mockUsycJson.bytecode;

  // Read compiled contract artifact for GigMarketEscrow
  const artifactPath = path.resolve('./artifacts_contract/contracts/GigMarketEscrow.sol/GigMarketEscrow.json');
  if (!fs.existsSync(artifactPath)) {
    console.error('ERROR: Contract JSON artifact not found. Please run "npm run compile" first.');
    process.exit(1);
  }

  const contractJson = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abi = contractJson.abi;
  const bytecode = contractJson.bytecode;

  try {
    console.log('Deploying MockUSYC contract on Arc Testnet...');
    const usycHash = await walletClient.deployContract({
      abi: mockUsycAbi,
      bytecode: mockUsycBytecode,
      args: [USDC_TOKEN_ADDRESS],
    });
    console.log(`MockUSYC Transaction hash: ${usycHash}`);
    console.log('Waiting for MockUSYC transaction to be mined...');
    const usycReceipt = await publicClient.waitForTransactionReceipt({ hash: usycHash });
    const mockUsycAddress = usycReceipt.contractAddress;
    console.log(`SUCCESS: MockUSYC deployed to: ${mockUsycAddress}`);

    console.log('Deploying GigMarketEscrow contract on Arc Testnet...');
    const hash = await walletClient.deployContract({
      abi,
      bytecode,
      args: [USDC_TOKEN_ADDRESS],
    });

    console.log(`Transaction hash: ${hash}`);
    console.log('Waiting for transaction to be mined...');
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const contractAddress = receipt.contractAddress;
    
    console.log(`\nSUCCESS: GigMarketEscrow deployed to: ${contractAddress}`);

    console.log('Setting USYC token address on GigMarketEscrow...');
    const setUsycHash = await walletClient.writeContract({
      address: contractAddress,
      abi,
      functionName: 'setUsycToken',
      args: [mockUsycAddress],
    });
    console.log(`setUsycToken transaction hash: ${setUsycHash}`);
    await publicClient.waitForTransactionReceipt({ hash: setUsycHash });
    console.log('USYC token configured on escrow contract!');

    // Configure Platform Treasury
    const platformTreasury = process.env.TREASURY_ADDRESS || account.address;
    console.log(`Setting treasury address on GigMarketEscrow to: ${platformTreasury}...`);
    const setTreasuryHash = await walletClient.writeContract({
      address: contractAddress,
      abi,
      functionName: 'setTreasury',
      args: [platformTreasury],
    });
    console.log(`setTreasury transaction hash: ${setTreasuryHash}`);
    await publicClient.waitForTransactionReceipt({ hash: setTreasuryHash });
    console.log('Treasury address successfully configured on escrow contract!');
    
    console.log(`Explorer Link: https://testnet.arcscan.app/address/${contractAddress}`);
    
    // Save contract address to a JSON file so that backend and frontend can read it
    const addressesDir = './db';
    if (!fs.existsSync(addressesDir)) {
      fs.mkdirSync(addressesDir);
    }
    fs.writeFileSync(
      path.join(addressesDir, 'contract-address.json'),
      JSON.stringify({ GigMarketEscrow: contractAddress, MockUSYC: mockUsycAddress }, null, 2)
    );
    console.log('Saved contract addresses to db/contract-address.json');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

main();
