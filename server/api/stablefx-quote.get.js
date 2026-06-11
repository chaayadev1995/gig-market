import { getQuery, defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const amount = query.amount || '1.00';
  const apiKey = process.env.CIRCLE_API_KEY;

  if (!apiKey || apiKey.startsWith('TEST_API_KEY_PLACEHOLDER')) {
    // Return mock quote
    return {
      success: true,
      rate: 0.92,
      quoteId: `mock_quote_${Date.now()}`,
      expiresAt: new Date(Date.now() + 600000).toISOString(),
      amountIn: amount,
      amountOut: (parseFloat(amount) * 0.92).toFixed(2)
    };
  }

  try {
    const isSandbox = apiKey.startsWith('SANDBOX') || apiKey.includes('test') || apiKey.includes('sandbox') || apiKey.startsWith('TEST_API_KEY');
    const baseUrl = isSandbox ? 'https://api-sandbox.circle.com' : 'https://api.circle.com';
    
    // Call Circle StableFX quotes API
    const response = await $fetch(`${baseUrl}/v1/exchange/stablefx/quotes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        from: {
          currency: 'USDC',
          amount: parseFloat(amount).toFixed(2)
        },
        to: {
          currency: 'EURC'
        }
      }
    });

    if (response) {
      const rate = response.price || (response.to?.amount && response.from?.amount ? (parseFloat(response.to.amount) / parseFloat(response.from.amount)).toString() : '0.92');
      return {
        success: true,
        rate: parseFloat(rate),
        quoteId: response.quoteId || `mock_quote_${Date.now()}`,
        expiresAt: response.expiresAt || new Date(Date.now() + 600000).toISOString(),
        amountIn: amount,
        amountOut: response.to?.amount || (parseFloat(amount) * parseFloat(rate)).toFixed(2)
      };
    }
    
    throw new Error('Invalid response structure from Circle API');
  } catch (error) {
    console.warn('[StableFX] Circle quotes API error, falling back to mock:', error.message || error);
    return {
      success: true,
      rate: 0.92,
      quoteId: `mock_quote_fallback_${Date.now()}`,
      expiresAt: new Date(Date.now() + 600000).toISOString(),
      amountIn: amount,
      amountOut: (parseFloat(amount) * 0.92).toFixed(2)
    };
  }
});
