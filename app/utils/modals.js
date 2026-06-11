import { ref } from 'vue';

// Queue and active modal state
export const modalQueue = ref([]);
export const activeModal = ref(null);

// Error mapping mapping raw blockchain/API errors to user-friendly messages
export const errorMap = {
  'USER_REJECTED': {
    title: 'Transaction Rejected',
    message: 'You have rejected the signature request in your wallet provider. Please try again when you are ready.',
    type: 'warning'
  },
  'INSUFFICIENT_FUNDS': {
    title: 'Insufficient Balance',
    message: 'Your wallet account does not have enough USDC/EURC stablecoins or gas to execute this action. Top up and retry.',
    type: 'error'
  },
  'TIMEOUT': {
    title: 'Request Timeout',
    message: 'The connection to Arc Testnet or the backend service timed out. Please check your network and try again.',
    type: 'error'
  },
  'NETWORK_ERROR': {
    title: 'Connection Disconnected',
    message: 'It seems you are offline or the selected blockchain node is currently unreachable. Check your router/internet connection.',
    type: 'error'
  },
  'ACTION_FAILED': {
    title: 'Transaction Execution Failed',
    message: 'The smart contract reverted this action. This typically happens if the gig milestone status has changed or has already been paid out.',
    type: 'error'
  }
};

// Store close timeout reference globally inside the module
let closeTimeout = null;

/**
 * Trigger a new modal pop-up. If a modal is already active, queues it automatically.
 */
export function showModal(config) {
  const modalConfig = {
    id: Date.now() + Math.random().toString(36).substr(2, 5),
    isOpen: true,
    type: config.type || 'confirm', // 'confirm' | 'loading' | 'success' | 'error' | 'warning' | 'tx'
    title: config.title || '',
    message: config.message || '',
    txHash: config.txHash || '',
    explorerUrl: config.explorerUrl || '',
    primaryLabel: config.primaryLabel !== undefined ? config.primaryLabel : 'Confirm',
    secondaryLabel: config.secondaryLabel !== undefined ? config.secondaryLabel : 'Cancel',
    isDestructive: config.isDestructive || false,
    preventClose: config.preventClose || false, // Disables backdrop click and ESC key
    errorDetails: config.errorDetails || '',
    warningCode: config.warningCode || '',
    onConfirm: config.onConfirm || null,
    onCancel: config.onCancel || null,
    onClose: config.onClose || null,
    retryAction: config.retryAction || null, // Optional retry callback flow
  };

  // If a modal close is pending, abort the close animation and transition immediately
  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
    activeModal.value = modalConfig;
    return modalConfig.id;
  }

  if (activeModal.value) {
    // If the active modal is a loading modal, replace it immediately to avoid timing clashing
    if (activeModal.value.type === 'loading') {
      activeModal.value = modalConfig;
    } else {
      modalQueue.value.push(modalConfig);
    }
  } else {
    activeModal.value = modalConfig;
  }
  
  return modalConfig.id;
}

/**
 * Programmatically close the active modal and transition to the next queued item
 */
export function closeModal() {
  if (!activeModal.value) return;
  
  const modal = activeModal.value;
  modal.isOpen = false;
  
  if (modal.onClose) {
    try {
      modal.onClose();
    } catch (e) {
      console.error('Error during modal onClose callback:', e);
    }
  }

  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }

  // Brief delay to match the transition fadeOut/slideDown exit animation
  closeTimeout = setTimeout(() => {
    activeModal.value = null;
    closeTimeout = null;
    if (modalQueue.value.length > 0) {
      activeModal.value = modalQueue.value.shift();
    }
  }, 250);
}

/**
 * Parse an error string or error object and fire the appropriate Error Modal
 */
export function handleError(error, retryCallback = null) {
  const errorStr = (error?.message || error || '').toString();
  console.error('Unified Error Handler caught:', error);

  let mapped = {
    title: 'Unexpected Error',
    message: 'An unknown anomaly occurred while communicating with the blockchain. Details are displayed below.',
    type: 'error'
  };

  // Identify common signatures
  if (errorStr.includes('User rejected') || errorStr.includes('rejected the request') || errorStr.includes('ACTION_REJECTED')) {
    mapped = errorMap.USER_REJECTED;
  } else if (errorStr.includes('insufficient funds') || errorStr.includes('exceeds balance') || errorStr.includes('INSUFFICIENT_FUNDS')) {
    mapped = errorMap.INSUFFICIENT_FUNDS;
  } else if (errorStr.includes('timeout') || errorStr.includes('Timeout') || errorStr.includes('ETIMEDOUT')) {
    mapped = errorMap.TIMEOUT;
  } else if (errorStr.includes('Network Error') || errorStr.includes('Failed to fetch') || errorStr.includes('offline')) {
    mapped = errorMap.NETWORK_ERROR;
  } else if (errorStr.includes('revert') || errorStr.includes('execution reverted')) {
    mapped = errorMap.ACTION_FAILED;
  }

  return showModal({
    type: mapped.type,
    title: mapped.title,
    message: mapped.message,
    errorDetails: errorStr,
    primaryLabel: retryCallback ? 'Retry Action' : 'Dismiss',
    secondaryLabel: retryCallback ? 'Cancel' : '',
    onConfirm: () => {
      if (retryCallback) {
        retryCallback();
      } else {
        closeModal();
      }
    },
    onCancel: closeModal
  });
}

// Global modal helper actions mapping
export const modals = {
  confirm: (title, message, onConfirm, onCancel = null, options = {}) => showModal({
    type: 'confirm',
    title,
    message,
    onConfirm: () => {
      closeModal();
      if (onConfirm) onConfirm();
    },
    onCancel: () => {
      closeModal();
      if (onCancel) onCancel();
    },
    ...options
  }),

  destructive: (title, message, onConfirm, onCancel = null, options = {}) => showModal({
    type: 'confirm',
    isDestructive: true,
    title,
    message,
    primaryLabel: 'Delete & Permanent Settle',
    onConfirm: () => {
      closeModal();
      if (onConfirm) onConfirm();
    },
    onCancel: () => {
      closeModal();
      if (onCancel) onCancel();
    },
    ...options
  }),

  loading: (title, message, options = {}) => showModal({
    type: 'loading',
    title,
    message,
    preventClose: true,
    primaryLabel: '',
    secondaryLabel: '',
    ...options
  }),

  success: (title, message, onConfirm = null, options = {}) => showModal({
    type: 'success',
    title,
    message,
    primaryLabel: 'Fantastic',
    secondaryLabel: '',
    onConfirm: () => {
      closeModal();
      if (onConfirm) onConfirm();
    },
    ...options
  }),

  warning: (title, message, onConfirm = null, options = {}) => showModal({
    type: 'warning',
    title,
    message,
    primaryLabel: 'Understand Risks',
    secondaryLabel: 'Go Back',
    onConfirm: () => {
      closeModal();
      if (onConfirm) onConfirm();
    },
    onCancel: closeModal,
    ...options
  }),

  txPending: (txHash, message = 'Your stablecoin transaction has been broadcast and is undergoing block validation on Arc Testnet.') => showModal({
    type: 'tx',
    title: 'Validating Transaction',
    message,
    txHash,
    explorerUrl: `https://testnet.arcscan.app/tx/${txHash}`,
    preventClose: true,
    primaryLabel: 'View on Explorer ↗',
    secondaryLabel: '', // Do not let user cancel during mining
    onConfirm: () => {
      if (txHash && txHash !== 'Pending') {
        window.open(`https://testnet.arcscan.app/tx/${txHash}`, '_blank');
      }
    }
  }),

  txSuccess: (txHash, message = 'Transaction successfully validated. Your on-chain state update is complete.') => showModal({
    type: 'success',
    title: 'Success!',
    message,
    txHash,
    explorerUrl: `https://testnet.arcscan.app/tx/${txHash}`,
    primaryLabel: 'View Explorer ↗',
    secondaryLabel: 'Close',
    onConfirm: () => {
      window.open(`https://testnet.arcscan.app/tx/${txHash}`, '_blank');
      closeModal();
    },
    onCancel: closeModal
  }),

  error: (title, message, details = '', options = {}) => showModal({
    type: 'error',
    title,
    message,
    errorDetails: details,
    primaryLabel: 'Acknowledge',
    secondaryLabel: '',
    onConfirm: closeModal,
    ...options
  })
};
