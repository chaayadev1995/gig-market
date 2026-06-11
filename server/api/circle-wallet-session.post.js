import { defineEventHandler, readBody } from 'h3';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userId, queryOnly, isSimulation } = body;

  if (!userId) {
    return {
      success: false,
      error: 'userId (email or identifier) is required'
    };
  }

  // Check if API key is configured or is default mock value
  const isCircleConfigured = 
    process.env.CIRCLE_API_KEY && 
    !process.env.CIRCLE_API_KEY.startsWith('TEST_API_KEY_PLACEHOLDER') &&
    process.env.CIRCLE_API_KEY !== 'your-circle-api-key-here';

  // Format a deterministic user UUID using the userId hash
  const hash = crypto.createHash('sha256').update(userId.trim().toLowerCase()).digest('hex');
  const circleUserId = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;

  const API_KEY = process.env.CIRCLE_API_KEY;
  const APP_ID = process.env.CIRCLE_APP_ID || 'your-circle-app-id-here';

  // Note: Web3 Services (w3s) endpoints always use api.circle.com for both sandbox and mainnet.
  const baseUrl = 'https://api.circle.com';

  function getSimulationResponse() {
    console.log(`[CircleUCW] Initiating simulation fallback for user: ${userId}`);
    const mockAddress = `0x${hash.slice(0, 40)}`;
    const needsSetup = userId.trim().toLowerCase().includes('new');

    if (needsSetup) {
      return {
        success: true,
        userId: circleUserId,
        userToken: 'mock_token_' + hash.slice(0, 12),
        encryptionKey: 'mock_encryption_key_xxxx',
        appId: 'mock_app_id_xxxx',
        challengeId: 'mock-challenge-uuid-setup-' + hash.slice(0, 8),
        status: 'INITIALIZING',
        isSimulation: true,
        mockAddress: mockAddress
      };
    } else {
      return {
        success: true,
        userId: circleUserId,
        userToken: 'mock_token_' + hash.slice(0, 12),
        encryptionKey: 'mock_encryption_key_xxxx',
        appId: 'mock_app_id_xxxx',
        wallets: [
          {
            id: 'mock-wallet-id-' + hash.slice(0, 8),
            address: mockAddress,
            blockchain: 'ARC-TESTNET',
            state: 'LIVE'
          }
        ],
        status: 'ACTIVE',
        isSimulation: true
      };
    }
  }

  if (isSimulation || !isCircleConfigured) {
    console.log(`[CircleUCW] ${isSimulation ? 'Simulation forced by client' : 'API key not configured'}. Initiating simulation for user: ${userId}`);
    const mockAddress = `0x${hash.slice(0, 40)}`;
    const needsSetup = userId.trim().toLowerCase().includes('new');

    if (needsSetup) {
      return {
        success: true,
        userId: circleUserId,
        userToken: 'mock_token_' + hash.slice(0, 12),
        encryptionKey: 'mock_encryption_key_xxxx',
        appId: 'mock_app_id_xxxx',
        challengeId: 'mock-challenge-uuid-setup-' + hash.slice(0, 8),
        status: 'INITIALIZING',
        isSimulation: true,
        mockAddress: mockAddress
      };
    } else {
      return {
        success: true,
        userId: circleUserId,
        userToken: 'mock_token_' + hash.slice(0, 12),
        encryptionKey: 'mock_encryption_key_xxxx',
        appId: 'mock_app_id_xxxx',
        wallets: [
          {
            id: 'mock-wallet-id-' + hash.slice(0, 8),
            address: mockAddress,
            blockchain: 'ETH-SEPOLIA',
            state: 'LIVE'
          }
        ],
        status: 'ACTIVE',
        isSimulation: true
      };
    }
  }

  try {
    console.log(`[CircleUCW] Generating token for Circle user: ${circleUserId}`);

    // 1. Try to create the user in case they don't exist
    await fetch(`${baseUrl}/v1/w3s/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: circleUserId })
    }).then(async res => {
      const text = await res.text();
      console.log(`[CircleUCW] User registration attempt response:`, text);
    }).catch(err => {
      console.warn('[CircleUCW] User registration failed or user already exists:', err);
    });

    // 2. Generate the user token and encryption key
    const tokenRes = await fetch(`${baseUrl}/v1/w3s/users/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: circleUserId })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(tokenData?.message || 'Failed to generate User Token');
    }

    const { userToken, encryptionKey } = tokenData.data;

    // 3. Fetch existing wallets
    const walletsRes = await fetch(`${baseUrl}/v1/w3s/wallets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-User-Token': userToken
      }
    });

    const walletsData = await walletsRes.json();
    const wallets = walletsData?.data?.wallets || [];

    if (wallets.length > 0) {
      console.log(`[CircleUCW] Active wallets found for user ${circleUserId}. Count: ${wallets.length}`);
      
      const arcWallet = wallets.find(w => w.blockchain === 'ARC-TESTNET');
      if (arcWallet) {
        // Reorder so ARC-TESTNET is index 0
        const orderedWallets = [arcWallet, ...wallets.filter(w => w.blockchain !== 'ARC-TESTNET')];
        return {
          success: true,
          userId: circleUserId,
          userToken,
          encryptionKey,
          appId: APP_ID,
          wallets: orderedWallets,
          status: 'ACTIVE',
          isSimulation: false
        };
      }

      // If we are just polling (queryOnly) during PIN challenge, return what we have
      if (queryOnly) {
        return {
          success: true,
          userId: circleUserId,
          userToken,
          encryptionKey,
          appId: APP_ID,
          wallets,
          status: 'ACTIVE',
          isSimulation: false
        };
      }

      // User has wallets, but none of them is ARC-TESTNET.
      // Trigger wallet creation for ARC-TESTNET!
      console.log(`[CircleUCW] User ${circleUserId} has wallets but no ARC-TESTNET wallet. Triggering ARC-TESTNET wallet creation...`);
      const walletRes = await fetch(`${baseUrl}/v1/w3s/user/wallets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'X-User-Token': userToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idempotencyKey: crypto.randomUUID(),
          blockchains: ['ARC-TESTNET', 'ETH-SEPOLIA'],
          accountType: 'SCA'
        })
      });
      
      const walletData = await walletRes.json();
      if (!walletRes.ok) {
        throw new Error(walletData?.message || 'Failed to create ARC-TESTNET wallet for user');
      }
      
      return {
        success: true,
        userId: circleUserId,
        userToken,
        encryptionKey,
        appId: APP_ID,
        challengeId: walletData.data.challengeId,
        status: 'INITIALIZING',
        isSimulation: false
      };
    }

    if (queryOnly) {
      console.log(`[CircleUCW] queryOnly is true. Returning empty wallet list for user ${circleUserId}.`);
      return {
        success: true,
        userId: circleUserId,
        userToken,
        encryptionKey,
        appId: APP_ID,
        wallets: [],
        status: 'INITIALIZING',
        isSimulation: false
      };
    }

    // 4. If no wallets, trigger user initialization or wallet creation to get a challengeId
    console.log(`[CircleUCW] No wallets found. Attempting to initialize user ${circleUserId} for wallet creation.`);
    
    let challengeId;
    const initRes = await fetch(`${baseUrl}/v1/w3s/user/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-User-Token': userToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        blockchains: ['ARC-TESTNET', 'ETH-SEPOLIA'],
        accountType: 'SCA'
      })
    });

    const initData = await initRes.json();
    if (initRes.ok) {
      challengeId = initData.data.challengeId;
    } else {
      // Check if the user is already initialized (error code 155106)
      const isAlreadyInitialized = initData?.code === 155106 || 
        (initData?.message && initData.message.toLowerCase().includes('already been initialized')) ||
        (initData?.message && initData.message.toLowerCase().includes('already initialized'));
        
      if (isAlreadyInitialized) {
        console.log(`[CircleUCW] User ${circleUserId} is already initialized. Requesting wallet creation challenge...`);
        const walletRes = await fetch(`${baseUrl}/v1/w3s/user/wallets`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'X-User-Token': userToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            idempotencyKey: crypto.randomUUID(),
            blockchains: ['ARC-TESTNET', 'ETH-SEPOLIA'],
            accountType: 'SCA'
          })
        });
        
        const walletData = await walletRes.json();
        if (!walletRes.ok) {
          throw new Error(walletData?.message || 'Failed to create wallets for initialized user');
        }
        challengeId = walletData.data.challengeId;
      } else {
        throw new Error(initData?.message || 'Failed to initialize User Wallets');
      }
    }

    return {
      success: true,
      userId: circleUserId,
      userToken,
      encryptionKey,
      appId: APP_ID,
      challengeId,
      status: 'INITIALIZING',
      isSimulation: false
    };
  } catch (error) {
    console.error('[CircleUCW] Backend error creating user session:', error);
    return {
      success: false,
      error: error.message || 'Server error configuring Circle session'
    };
  }
});
