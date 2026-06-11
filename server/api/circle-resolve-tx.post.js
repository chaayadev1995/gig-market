import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event) || {};
  const { userToken, walletId } = body;

  if (!userToken || !walletId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'userToken and walletId are required'
    });
  }

  const API_KEY = process.env.CIRCLE_API_KEY;
  if (!API_KEY || API_KEY.startsWith('TEST_API_KEY_PLACEHOLDER')) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Circle API key is not configured'
    });
  }

  const baseUrl = 'https://api.circle.com';

  try {
    const response = await fetch(`${baseUrl}/v1/w3s/transactions?pageSize=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-User-Token': userToken,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || 'Failed to list transactions from Circle');
    }

    const transactions = data?.data?.transactions || [];
    
    // Find the latest transaction for the user's wallet on ARC-TESTNET that has a txHash
    const match = transactions.find(t => 
      t.walletId === walletId && 
      t.blockchain === 'ARC-TESTNET' && 
      t.txHash
    );

    if (match) {
      return {
        success: true,
        transaction: match
      };
    }

    return {
      success: false,
      message: 'No matching transaction with txHash found yet'
    };
  } catch (error) {
    console.error('[Circle-Resolve-Tx] Error resolving transaction:', error);
    return {
      success: false,
      error: error.message || 'Failed to resolve transaction'
    };
  }
});
