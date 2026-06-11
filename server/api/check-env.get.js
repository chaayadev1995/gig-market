import { defineEventHandler } from 'h3';

export default defineEventHandler((event) => {
  const key = process.env.CIRCLE_API_KEY;
  const appId = process.env.CIRCLE_APP_ID;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  console.log('=== CURRENT SERVER PROCESS ENV ===');
  console.log('CIRCLE_API_KEY:', key ? `${key.slice(0, 20)}... (length: ${key.length})` : 'UNDEFINED');
  console.log('CIRCLE_APP_ID:', appId || 'UNDEFINED');
  console.log('CIRCLE_ENTITY_SECRET:', entitySecret ? `${entitySecret.slice(0, 10)}...` : 'UNDEFINED');
  console.log('===================================');

  return {
    success: true,
    apiKeyLength: key ? key.length : 0,
    apiKeyPrefix: key ? key.slice(0, 20) : null,
    appId,
    entitySecretConfigured: !!entitySecret
  };
});
