import { defineEventHandler, getQuery } from 'h3';

// In-memory store to simulate real-time CCTP attestation generation delay (8 seconds)
const mockBridgeAttempts = new Map();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { messageHash } = query;

  if (!messageHash) {
    return { error: 'Missing messageHash query parameter' };
  }

  // Handle Mock/Simulation mode
  if (messageHash.startsWith('mock_')) {
    if (!mockBridgeAttempts.has(messageHash)) {
      mockBridgeAttempts.set(messageHash, Date.now());
      return { status: 'pending', message: 'Circle CCTP Attestation is being generated...' };
    }

    const startTime = mockBridgeAttempts.get(messageHash);
    const elapsed = Date.now() - startTime;

    if (elapsed > 8000) {
      // Return a simulated mock attestation signature (65 bytes hex payload)
      const mockSignature = '0x' + 'a1b2c3d4e5f6'.repeat(10) + '77889900aabbccddeeff11223344556677889900aabb';
      return {
        status: 'complete',
        attestation: mockSignature,
        messageHash,
        sourceChain: 'Base_Sepolia',
        destinationChain: 'Arc_Testnet',
        amount: '100.00'
      };
    } else {
      return { 
        status: 'pending', 
        message: `Circle CCTP Attestation is being generated... (${Math.round((8000 - elapsed) / 1000)}s remaining)` 
      };
    }
  }

  // Live Mode: Query Circle CCTP Iris API Sandbox
  try {
    const response = await fetch(`https://iris-api-sandbox.circle.com/attestations/${messageHash}`);
    if (!response.ok) {
      return { status: 'pending', error: `Iris API responded with status ${response.status}` };
    }
    const data = await response.json();
    return {
      status: data.status, // 'complete' or 'pending'
      attestation: data.attestation // Hex string signature if complete, null otherwise
    };
  } catch (error) {
    console.error('Error querying CCTP Iris API:', error);
    return { status: 'pending', error: error.message };
  }
});
