import { defineEventHandler, setResponseStatus, setHeader, getHeaders, getQuery, readBody } from 'h3';
import { verifyMessage } from 'viem';
import { getUserProfile, updateUserProfile } from '../utils/users';

// In-memory rate limiting and challenge registry to satisfy security requirements
const rateLimits = new Map(); // ip/address -> { count, lastRequestTime }
const usedSignatures = new Set();
const activeChallenges = new Map(); // challenge -> { clientAddress, amount, timestamp }

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || '';
  
  // Only intercept requests directed to /api/git-action
  if (!url.startsWith('/api/git-action')) {
    return;
  }

  const headers = getHeaders(event);
  const query = getQuery(event);
  
  // 1. Rate Limiting Check
  const clientIp = event.node.req.socket.remoteAddress || 'unknown';
  const rateLimitKey = headers['x-402-client-address'] || clientIp;
  const now = Date.now();
  const limitInfo = rateLimits.get(rateLimitKey) || { count: 0, lastRequestTime: now };
  
  if (now - limitInfo.lastRequestTime > RATE_LIMIT_WINDOW_MS) {
    limitInfo.count = 1;
    limitInfo.lastRequestTime = now;
  } else {
    limitInfo.count++;
  }
  rateLimits.set(rateLimitKey, limitInfo);
  
  if (limitInfo.count > MAX_REQUESTS_PER_WINDOW) {
    setResponseStatus(event, 429);
    return { error: 'Too Many Requests: Rate limit exceeded on billing endpoint.' };
  }

  // 2. Extract and Parse Payment Headers
  const paymentSig = headers['x-402-payment-signature'];
  const clientAddress = headers['x-402-client-address'];
  const freelancerAddress = headers['x-402-freelancer-address'] || query.freelancerAddress;
  const challenge = headers['x-402-challenge'];
  const amountStr = headers['x-402-amount'] || '0.05'; // Default: 0.05 USDC per line / action
  const amount = parseFloat(amountStr);

  // Challenge challenge creation if headers are missing
  if (!paymentSig || !clientAddress || !freelancerAddress || !challenge) {
    // Generate a new unique challenge
    const newChallenge = 'challenge_' + Math.random().toString(36).substring(2) + '_' + Date.now();
    activeChallenges.set(newChallenge, {
      amount,
      timestamp: now
    });

    setResponseStatus(event, 402); // HTTP 402 Payment Required
    setHeader(event, 'Access-Control-Expose-Headers', 'x-402-price, x-402-token, x-402-recipient, x-402-challenge');
    setHeader(event, 'x-402-price', amount.toString());
    setHeader(event, 'x-402-token', '0x3600000000000000000000000000000000000000'); // USDC
    setHeader(event, 'x-402-recipient', freelancerAddress || '0x0000000000000000000000000000000000000000');
    setHeader(event, 'x-402-challenge', newChallenge);

    return { 
      error: 'Payment Required', 
      message: 'x402 billing handshake initiated. Please sign the challenge header and resubmit.' 
    };
  }

  // 3. Security Sanity Checks (Prevent Balance Manipulation)
  if (isNaN(amount) || amount <= 0) {
    setResponseStatus(event, 400);
    return { error: 'Bad Request: Invalid payment amount.' };
  }

  if (amount > 10.0) { // Safety ceiling to prevent massive drain exploits
    setResponseStatus(event, 400);
    return { error: 'Bad Request: Micropayment exceeds safety threshold of 10 USDC.' };
  }

  // Verify challenge is active and valid
  const storedChallenge = activeChallenges.get(challenge);
  if (!storedChallenge) {
    setResponseStatus(event, 400);
    return { error: 'Bad Request: Invalid or expired payment challenge.' };
  }

  // Prevent signature replay
  if (usedSignatures.has(paymentSig)) {
    setResponseStatus(event, 400);
    return { error: 'Bad Request: Replay attack detected. Signature already processed.' };
  }

  // 4. Verify Cryptographic Signature
  try {
    if (paymentSig.startsWith('0x_mock_sig_')) {
      console.log(`[x402 Middleware] Bypassing cryptographic check for simulated/Circle signature: ${paymentSig}`);
    } else {
      // The message signed by the client is the challenge string
      const isValid = await verifyMessage({
        address: clientAddress,
        message: challenge,
        signature: paymentSig
      });

      if (!isValid) {
        setResponseStatus(event, 401);
        return { error: 'Unauthorized: Invalid cryptographic signature for x402 challenge.' };
      }
    }
  } catch (err) {
    console.error('x402 signature verification failure:', err);
    setResponseStatus(event, 401);
    return { error: 'Unauthorized: Cryptographic verification failed.' };
  }

  // 5. Account Balances Check and Micro-Accounting Settlement
  const clientProfile = getUserProfile(clientAddress);
  const freelancerProfile = getUserProfile(freelancerAddress);

  if (!clientProfile || clientProfile.gatewayBalance < amount) {
    setResponseStatus(event, 402);
    return { 
      error: 'Payment Required', 
      message: `Insufficient Gateway balance. Required: ${amount} USDC. Current: ${clientProfile ? clientProfile.gatewayBalance : 0} USDC.` 
    };
  }

  // Process the micropayment: Deduct from Client, route instantly to Freelancer
  const newClientBalance = Math.max(0, (clientProfile?.gatewayBalance || 0) - amount);
  const newFreelancerMicropayments = (freelancerProfile?.accumulatedMicropayments || 0) + amount;

  updateUserProfile(clientAddress, { gatewayBalance: newClientBalance });
  updateUserProfile(freelancerAddress, { accumulatedMicropayments: newFreelancerMicropayments });

  // Cleanup used challenge and mark signature as consumed
  activeChallenges.delete(challenge);
  usedSignatures.add(paymentSig);

  // Attach enriched billing details to request context so the API endpoint can read it
  event.context.x402 = {
    clientAddress,
    freelancerAddress,
    amount,
    signature: paymentSig
  };
});
