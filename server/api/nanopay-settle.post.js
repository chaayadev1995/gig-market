import { defineEventHandler, readBody, setResponseStatus } from 'h3';
import { getUserProfile, updateUserProfile } from '../utils/users';
import { executeUsdcTransfer } from '../utils/circle';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!body || !body.action || !body.walletAddress) {
    setResponseStatus(event, 400);
    return { error: 'Bad Request: Missing required parameters (action, walletAddress).' };
  }

  const { action, walletAddress, amount } = body;
  const profile = getUserProfile(walletAddress);

  if (!profile) {
    setResponseStatus(event, 404);
    return { error: 'Not Found: User profile not found.' };
  }

  if (action === 'deposit') {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setResponseStatus(event, 400);
      return { error: 'Bad Request: Invalid deposit amount.' };
    }

    const newBalance = (profile.gatewayBalance || 0) + depositAmount;
    const updated = updateUserProfile(walletAddress, { gatewayBalance: newBalance });
    
    return {
      success: true,
      message: `Successfully deposited ${depositAmount} USDC into Gateway channel.`,
      profile: updated
    };
  }

  if (action === 'withdraw') {
    const withdrawAmount = profile.accumulatedMicropayments || 0;
    if (withdrawAmount <= 0) {
      setResponseStatus(event, 400);
      return { error: 'Bad Request: No micropayments accumulated to withdraw.' };
    }

    try {
      console.log(`Executing micropayment withdrawal of ${withdrawAmount} USDC for ${walletAddress}...`);
      const txResult = await executeUsdcTransfer(walletAddress, withdrawAmount);
      
      // Update freelancer local balance profile
      const updated = updateUserProfile(walletAddress, {
        accumulatedMicropayments: 0.0 // reset to zero
      });

      return {
        success: true,
        message: `Successfully withdrew ${withdrawAmount} USDC to your wallet address.`,
        txHash: txResult.txHash,
        profile: updated
      };
    } catch (error) {
      console.error('Micropayment withdrawal transaction failed:', error);
      setResponseStatus(event, 500);
      return { error: `Internal Server Error: On-chain transfer failed. ${error.message || error}` };
    }
  }

  if (action === 'get_profile') {
    return {
      success: true,
      profile
    };
  }

  setResponseStatus(event, 400);
  return { error: 'Bad Request: Unsupported action.' };
});
