import { defineEventHandler, readBody, createError } from 'h3';
import crypto from 'crypto';
import { getCircleConfigStatus, getContractAddress } from '../utils/circle';

// In-memory rate limiter cache
const rateLimitMap = new Map();
const LIMIT = 15; // Max 15 requests per minute
const WINDOW_MS = 60 * 1000; // 1 minute window

function isRateLimited(key) {
  const now = Date.now();
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, [now]);
    return false;
  }
  
  const timestamps = rateLimitMap.get(key).filter(t => now - t < WINDOW_MS);
  if (timestamps.length >= LIMIT) {
    return true;
  }
  
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return false;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event) || {};
  const ip = event.node.req.socket.remoteAddress || 'unknown';
  
  // Apply rate limiting based on requester's IP or userAddress
  const rateLimitKey = body.userAddress || ip;
  if (isRateLimited(rateLimitKey)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Rate limit exceeded. Sponsored transaction request throttled to prevent abuse.'
    });
  }
  
  const { 
    walletId,
    contractAddress, 
    abiFunctionSignature, 
    abiParameters,
    isSimulation,
    userAddress
  } = body;

  const status = getCircleConfigStatus();

  // If simulation mode or Circle is not fully configured, fall back to mock paymaster
  if (isSimulation || status.mode === 'LOCAL_KEY_FALLBACK') {
    console.log('[Sponsor-Tx] Simulating paymaster authorization');
    
    // Generate a mock transaction hash and paymaster signature
    const mockTxHash = '0x' + crypto.randomBytes(32).toString('hex');
    const mockPaymasterAddress = status.paymasterAddress;
    const mockSignature = '0x' + crypto.randomBytes(65).toString('hex');
    const paymasterAndData = mockPaymasterAddress + mockSignature.slice(2);

    return {
      success: true,
      sponsored: true,
      paymasterAndData,
      txHash: mockTxHash,
      estimatedGasSaved: '0.0045', // simulated USDC gas saved
      isSimulation: true
    };
  }

  // Live Mode: Dispatch to Circle User-Controlled Wallet execution.
  // In Circle's SCA architecture, gas station policy configured in the developer console
  // automatically handles the sponsorship of the transaction once it is initiated.
  const API_KEY = process.env.CIRCLE_API_KEY;
  try {
    console.log(`[Sponsor-Tx] Dispatching contract execution challenge via Circle for user: ${userAddress}`);
    
    const response = await fetch('https://api.circle.com/v1/w3s/user/transactions/contractExecution', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-User-Token': body.userToken,
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
      throw new Error(data?.message || 'Circle Gas Station API rejected transaction sponsorship');
    }

    return {
      success: true,
      sponsored: true,
      challengeId: data.data.challengeId,
      estimatedGasSaved: '0.0050',
      isSimulation: false
    };
  } catch (error) {
    console.error('[Sponsor-Tx] Failed to execute sponsored transaction:', error);
    return {
      success: false,
      error: error.message || 'Gas Station sponsorship dispatch failed'
    };
  }
});
