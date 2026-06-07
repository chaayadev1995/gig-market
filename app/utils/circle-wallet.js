// Circle User-Controlled Wallets Web SDK helper
import { ref } from 'vue';

export const circleUserWallet = ref(null);
export const circleSessionToken = ref(null);
export const circleEncryptionKey = ref(null);
export const circleAppId = ref(null);
export const circleUserId = ref(null);
export const isSimulationMode = ref(false);

let sdkInstance = null;

/**
 * Initialize Circle Web SDK client-side
 */
export async function initCircleSdk(appId, userToken, encryptionKey) {
  if (isSimulationMode.value) {
    console.log('[CircleSDK] Initializing Simulation Mode SDK');
    return true;
  }

  try {
    // Dynamic import to prevent Nuxt build-time issues
    const { W3SSdk } = await import('@circle-fin/w3s-pw-web-sdk');
    
    sdkInstance = new W3SSdk({
      appSettings: {
        appId: appId
      }
    });

    sdkInstance.setAuthentication({
      userToken: userToken,
      encryptionKey: encryptionKey
    });

    console.log('[CircleSDK] SDK Initialized successfully');
    return true;
  } catch (error) {
    console.error('[CircleSDK] Error initializing SDK:', error);
    throw error;
  }
}

/**
 * Execute a Circle Challenge (e.g., wallet creation, PIN setup, tx sign)
 */
export function executeChallenge(challengeId) {
  if (isSimulationMode.value) {
    return new Promise((resolve) => {
      console.log('[CircleSDK] Simulating challenge execution for ID:', challengeId);
      setTimeout(() => {
        resolve({
          status: 'COMPLETE',
          type: 'PIN_CREATION',
          data: {
            mockSignature: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
          }
        });
      }, 1500);
    });
  }

  return new Promise((resolve, reject) => {
    if (!sdkInstance) {
      return reject(new Error('Circle Web SDK is not initialized. Call initCircleSdk first.'));
    }

    sdkInstance.execute(challengeId, (error, result) => {
      if (error) {
        console.error('[CircleSDK] Challenge execution failed:', error);
        return reject(error);
      }
      console.log('[CircleSDK] Challenge execution succeeded:', result);
      resolve(result);
    });
  });
}

/**
 * Check if the Circle wallet is connected and saved in local state
 */
export function checkPersistedWallet() {
  if (typeof window === 'undefined') return;

  const savedWallet = localStorage.getItem('circle_wallet');
  const savedToken = localStorage.getItem('circle_user_token');
  const savedKey = localStorage.getItem('circle_encryption_key');
  const savedUserId = localStorage.getItem('circle_user_id');
  const savedAppId = localStorage.getItem('circle_app_id');
  const savedSim = localStorage.getItem('circle_is_simulation');

  if (savedWallet && savedToken) {
    circleUserWallet.value = JSON.parse(savedWallet);
    circleSessionToken.value = savedToken;
    circleEncryptionKey.value = savedKey;
    circleUserId.value = savedUserId;
    circleAppId.value = savedAppId;
    isSimulationMode.value = savedSim === 'true';
    
    // Attempt sdk re-initialization
    initCircleSdk(savedAppId, savedToken, savedKey).catch(err => {
      console.error('Failed to re-initialize Circle SDK:', err);
    });
  }
}

/**
 * Persist wallet state to local storage
 */
export function persistWalletState(wallet, userToken, encryptionKey, appId, userId, isSim = false) {
  circleUserWallet.value = wallet;
  circleSessionToken.value = userToken;
  circleEncryptionKey.value = encryptionKey;
  circleAppId.value = appId;
  circleUserId.value = userId;
  isSimulationMode.value = isSim;

  if (typeof window !== 'undefined') {
    localStorage.setItem('circle_wallet', JSON.stringify(wallet));
    localStorage.setItem('circle_user_token', userToken);
    localStorage.setItem('circle_encryption_key', encryptionKey);
    localStorage.setItem('circle_app_id', appId);
    localStorage.setItem('circle_user_id', userId);
    localStorage.setItem('circle_is_simulation', isSim ? 'true' : 'false');
  }
}

/**
 * Clear the Circle session from local storage
 */
export function clearWalletState() {
  circleUserWallet.value = null;
  circleSessionToken.value = null;
  circleEncryptionKey.value = null;
  circleAppId.value = null;
  circleUserId.value = null;
  isSimulationMode.value = false;

  if (typeof window !== 'undefined') {
    localStorage.removeItem('circle_wallet');
    localStorage.removeItem('circle_user_token');
    localStorage.removeItem('circle_encryption_key');
    localStorage.removeItem('circle_app_id');
    localStorage.removeItem('circle_user_id');
    localStorage.removeItem('circle_is_simulation');
  }
}
