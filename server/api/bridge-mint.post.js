import { defineEventHandler, readBody } from 'h3';
import { executeReceiveMessage } from '../utils/circle';

export default defineEventHandler(async (event) => {
  const body = await readBody(event) || {};
  const { messageBytes, attestationSignature } = body;

  if (!messageBytes || !attestationSignature) {
    return { success: false, error: 'Missing messageBytes or attestationSignature' };
  }

  // Handle Mock/Simulation Mode
  if (messageBytes.startsWith('0xmockbytes_')) {
    const randomHex = () => Math.floor(Math.random() * 1e16).toString(16);
    const mockMintTxHash = `mock_mint_0x${randomHex()}${randomHex()}`;
    return {
      success: true,
      txHash: mockMintTxHash,
      isSimulation: true
    };
  }

  try {
    const result = await executeReceiveMessage(messageBytes, attestationSignature);
    return {
      success: true,
      txHash: result.txHash,
      isSimulation: false
    };
  } catch (error) {
    console.error('CCTP Bridge Mint Backend handler error:', error);
    return {
      success: false,
      error: error.message || 'CCTP message relay execution failed'
    };
  }
});
