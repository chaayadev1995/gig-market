import { createPublicClient, createWalletClient, http, custom, keccak256, pad } from 'viem';
import { isSimulationMode, activeWalletProvider } from './circle-wallet';

// CCTP Testnet Contract & Network Configs
export const BRIDGE_NETWORKS = {
  Base_Sepolia: {
    name: 'Base Sepolia',
    domain: 6,
    chainId: 84532,
    rpc: 'https://sepolia.base.org',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    tokenMessenger: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275'
  },
  Ethereum_Sepolia: {
    name: 'Ethereum Sepolia',
    domain: 0,
    chainId: 11155111,
    rpc: 'https://rpc.ankr.com/eth_sepolia',
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    tokenMessenger: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275'
  },
  Arbitrum_Sepolia: {
    name: 'Arbitrum Sepolia',
    domain: 3,
    chainId: 421614,
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
    usdcAddress: '0xf3c3351d6bd0098eeb33ca8f830faf2a141ea2e1',
    tokenMessenger: '0xb43db544E2c27092c107639Ad201b3dEfAbcF192'
  },
  Arc_Testnet: {
    name: 'Arc Testnet',
    domain: 26,
    chainId: 5042002,
    rpc: 'https://rpc.testnet.arc.network',
    usdcAddress: '0x3600000000000000000000000000000000000000',
    tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
    messageTransmitter: '0x26413b5220c926949a0e6760f38b16c1E11D3156'
  }
};

// CCTP MessageSent event topic: keccak256("MessageSent(bytes)")
const MESSAGE_SENT_EVENT_TOPIC = '0x8c52619fa177c61e708779116e05d7616223451000673d32847953284050865c';

const ERC20_APPROVE_ABI = [
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

const TOKEN_MESSENGER_ABI = [
  {
    name: 'depositForBurn',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'destinationDomain', type: 'uint32' },
      { name: 'mintRecipient', type: 'bytes32' },
      { name: 'burnToken', type: 'address' }
    ],
    outputs: [{ name: 'nonce', type: 'uint64' }]
  }
];

const MESSAGE_TRANSMITTER_ABI = [
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

/**
 * Format standard EVM 20-byte address to CCTP 32-byte format (left-padded with zeros)
 */
function addressToBytes32(address) {
  return pad(address, { size: 32 });
}

/**
 * Helper to convert float strings into 6 decimals bigints
 */
function toUSDCUnits(amountString) {
  const parsed = parseFloat(amountString);
  if (isNaN(parsed) || parsed < 0) return 0n;
  return BigInt(Math.floor(parsed * 1000000));
}

/**
 * Initiates the burn of USDC on the source chain (Base, Sepolia, etc.)
 */
export async function initiateBurn(sourceChainKey, amount, recipientArcAddress) {
  const sourceNetwork = BRIDGE_NETWORKS[sourceChainKey];
  if (!sourceNetwork) throw new Error(`Invalid source chain key: ${sourceChainKey}`);

  if (isSimulationMode.value) {
    const randomHex = () => Math.floor(Math.random() * 1e16).toString(16);
    const mockBurnTxHash = `mock_burn_0x${randomHex()}${randomHex()}`;
    const mockMessageHash = `mock_msg_0x${randomHex()}${randomHex()}`;
    const mockMessageBytes = `0xmockbytes_${randomHex()}`;
    return {
      burnTxHash: mockBurnTxHash,
      messageHash: mockMessageHash,
      messageBytes: mockMessageBytes,
      amount,
      sourceChain: sourceChainKey,
      status: 'success'
    };
  }

  // Live Mode: Require a browser wallet extension or connected provider
  const provider = activeWalletProvider.value || (typeof window !== 'undefined' ? window.ethereum : null);
  if (!provider) {
    throw new Error('No wallet provider detected. Please connect your wallet first.');
  }

  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  const userAddress = accounts[0];

  const sourceClient = createPublicClient({
    transport: http(sourceNetwork.rpc)
  });

  const walletClient = createWalletClient({
    account: userAddress,
    transport: custom(provider)
  });

  // Ensure wallet is connected to correct source chain
  const chainId = await walletClient.getChainId();
  if (chainId !== sourceNetwork.chainId) {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${sourceNetwork.chainId.toString(16)}` }]
      });
    } catch (switchError) {
      throw new Error(`Please switch your wallet to ${sourceNetwork.name} (Chain ID: ${sourceNetwork.chainId})`);
    }
  }

  const usdcUnits = toUSDCUnits(amount);

  // 1. Approve TokenMessenger
  const approveHash = await walletClient.writeContract({
    address: sourceNetwork.usdcAddress,
    abi: ERC20_APPROVE_ABI,
    functionName: 'approve',
    args: [sourceNetwork.tokenMessenger, usdcUnits]
  });
  await sourceClient.waitForTransactionReceipt({ hash: approveHash });

  // 2. Call depositForBurn
  const recipientBytes32 = addressToBytes32(recipientArcAddress);
  const burnHash = await walletClient.writeContract({
    address: sourceNetwork.tokenMessenger,
    abi: TOKEN_MESSENGER_ABI,
    functionName: 'depositForBurn',
    args: [usdcUnits, BRIDGE_NETWORKS.Arc_Testnet.domain, recipientBytes32, sourceNetwork.usdcAddress]
  });

  const receipt = await sourceClient.waitForTransactionReceipt({ hash: burnHash });

  // 3. Extract message bytes from logs
  const log = receipt.logs.find(l => l.topics[0] === MESSAGE_SENT_EVENT_TOPIC);
  if (!log) {
    throw new Error('Failed to find CCTP MessageSent event in burn logs.');
  }

  // The first data chunk contains the raw message bytes
  const messageBytes = log.data;
  const messageHash = keccak256(messageBytes);

  return {
    burnTxHash: burnHash,
    messageHash,
    messageBytes,
    amount,
    sourceChain: sourceChainKey,
    status: 'success'
  };
}

/**
 * Polls our Nuxt backend /api/bridge-status to wait for attestation generation
 */
export async function pollBridgeAttestation(messageHash, onProgress) {
  const maxAttempts = 60; // 5 minutes max
  for (let i = 0; i < maxAttempts; i++) {
    if (onProgress) {
      onProgress(`Polling attestation (Attempt ${i + 1}/${maxAttempts})...`);
    }
    const response = await fetch(`/api/bridge-status?messageHash=${messageHash}`);
    const data = await response.json();

    if (data.status === 'complete' && data.attestation) {
      return data.attestation;
    }

    if (data.error) {
      console.warn('Attestation API warning:', data.error);
    }

    // Wait 5 seconds between polls
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  throw new Error('Timeout waiting for CCTP attestation.');
}

/**
 * Mints the bridged USDC onto Arc Testnet.
 * Because native gas is USDC and the user is an SCA, we can submit this sponsored!
 */
export async function mintOnArc(messageBytes, attestationSignature) {
  if (isSimulationMode.value || messageBytes.startsWith('0xmockbytes_')) {
    const randomHex = () => Math.floor(Math.random() * 1e16).toString(16);
    return `mock_mint_0x${randomHex()}${randomHex()}`;
  }

  // Call our backend endpoint to execute and sponsor the receiveMessage transaction
  const response = await $fetch('/api/bridge-mint', {
    method: 'POST',
    body: {
      messageBytes,
      attestationSignature
    }
  });

  if (!response || !response.success) {
    throw new Error(response?.error || 'Minting on Arc failed.');
  }

  return response.txHash;
}
