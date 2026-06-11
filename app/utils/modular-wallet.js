import { ref } from 'vue';

// Reactive client-side metrics for sponsored gas dashboard
export const sponsoredTxCount = ref(0);
export const sponsoredGasSaved = ref(0.00);

// Initialize metrics from localStorage on client side
if (typeof window !== 'undefined') {
  sponsoredTxCount.value = parseInt(localStorage.getItem('sponsored_tx_count') || '0');
  sponsoredGasSaved.value = parseFloat(localStorage.getItem('sponsored_gas_saved') || '0.00');
}

export function incrementSponsoredMetrics(gasSavedAmount) {
  sponsoredTxCount.value += 1;
  sponsoredGasSaved.value += parseFloat(gasSavedAmount);
  if (typeof window !== 'undefined') {
    localStorage.setItem('sponsored_tx_count', sponsoredTxCount.value.toString());
    localStorage.setItem('sponsored_gas_saved', sponsoredGasSaved.value.toFixed(4));
  }
}

/**
 * Builds, signs (via challenge), and broadcasts a sponsored User Operation.
 * In Circle's User-Controlled Wallets, the transaction uses the SCA account type
 * and is sponsored by the platform's Gas Station policy.
 */
export async function executeSponsoredTransaction({
  walletId,
  contractAddress,
  abiFunctionSignature,
  abiParameters,
  userToken,
  userAddress,
  isSimulation,
  executeChallengeFn
}) {
  console.log(`[ModularWallet] Initiating gasless sponsored execution for: ${abiFunctionSignature}`);

  // 1. Request gas station authorization from backend sponsor-tx api
  const response = await $fetch('/api/sponsor-tx', {
    method: 'POST',
    body: {
      walletId,
      contractAddress,
      abiFunctionSignature,
      abiParameters,
      userToken,
      userAddress,
      isSimulation
    }
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to authorize sponsored transaction');
  }

  // 2. Handle Simulation Mode
  if (response.isSimulation) {
    console.log(`[ModularWallet] Simulated sponsored tx generated. Tx Hash: ${response.txHash}`);
    incrementSponsoredMetrics(response.estimatedGasSaved || '0.0045');
    return {
      success: true,
      txHash: response.txHash,
      sponsored: true,
      gasSaved: response.estimatedGasSaved
    };
  }

  // 3. Handle Live Mode: Execute the Circle signing challenge
  if (!executeChallengeFn) {
    throw new Error('Circle SDK challenge handler is not initialized');
  }

  console.log(`[ModularWallet] Challenge generated. Challenge ID: ${response.challengeId}`);
  const challengeResult = await executeChallengeFn(response.challengeId);
  
  let txHash = 'Pending';
  console.log(`[ModularWallet] Challenge execution completed. Polling latest transactions for wallet: ${walletId}`);
  
  // Poll every 1.5 seconds for up to 30 times (45 seconds max) to resolve the transaction hash
  for (let i = 0; i < 30; i++) {
    try {
      const resolveRes = await $fetch('/api/circle-resolve-tx', {
        method: 'POST',
        body: { userToken, walletId }
      });
      if (resolveRes.success && resolveRes.transaction?.txHash) {
        txHash = resolveRes.transaction.txHash;
        console.log(`[ModularWallet] Successfully resolved txHash from transactions list: ${txHash}`);
        break;
      }
    } catch (err) {
      console.warn('[ModularWallet] Error resolving latest transaction:', err.message || err);
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  if (txHash === 'Pending') {
    txHash = challengeResult?.data?.txHash || 'Pending';
  }

  incrementSponsoredMetrics(response.estimatedGasSaved || '0.0050');

  return {
    success: true,
    txHash,
    sponsored: true,
    gasSaved: response.estimatedGasSaved
  };
}
