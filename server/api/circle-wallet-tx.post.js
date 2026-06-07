import { defineEventHandler, readBody } from 'h3';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { 
    userId, 
    userToken, 
    walletId, 
    contractAddress, 
    abiFunctionSignature, 
    abiParameters,
    isSimulation 
  } = body;

  if (isSimulation) {
    console.log('[CircleUCW-Tx] Simulating transaction execution challenge creation');
    return {
      success: true,
      challengeId: 'mock-tx-challenge-uuid-' + crypto.randomUUID().slice(0, 8),
      isSimulation: true
    };
  }

  const isCircleConfigured = 
    process.env.CIRCLE_API_KEY && 
    !process.env.CIRCLE_API_KEY.startsWith('TEST_API_KEY') &&
    process.env.CIRCLE_API_KEY !== 'your-circle-api-key-here';

  if (!isCircleConfigured) {
    return {
      success: false,
      error: 'Circle API key is not configured'
    };
  }

  const API_KEY = process.env.CIRCLE_API_KEY;

  try {
    console.log(`[CircleUCW-Tx] Creating contract execution transaction challenge for wallet ${walletId}`);
    
    const response = await fetch('https://api.circle.com/v1/w3s/user/transactions/contractExecution', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-User-Token': userToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        walletId: walletId,
        contractAddress: contractAddress,
        abiFunctionSignature: abiFunctionSignature,
        abiParameters: abiParameters,
        feeLevel: 'MEDIUM'
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || 'Failed to create transaction challenge');
    }

    return {
      success: true,
      challengeId: data.data.challengeId,
      isSimulation: false
    };
  } catch (error) {
    console.error('[CircleUCW-Tx] Backend error creating transaction challenge:', error);
    return {
      success: false,
      error: error.message || 'Server error creating transaction challenge'
    };
  }
});
