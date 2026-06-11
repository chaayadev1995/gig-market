import { defineEventHandler, getQuery, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = query.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Transaction ID (id) is required'
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
    console.log(`[Circle-Tx-Status] Fetching status for transaction ID: ${id}`);
    const response = await fetch(`${baseUrl}/v1/w3s/transactions/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || 'Failed to fetch transaction status from Circle');
    }

    return {
      success: true,
      transaction: data.data.transaction
    };
  } catch (error) {
    console.error('[Circle-Tx-Status] Error fetching transaction status:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch transaction status'
    };
  }
});
