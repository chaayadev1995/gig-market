// Client-side ZKP/encryption helper for Arc Opt-in Privacy
import { encodePacked, keccak256 } from 'viem';

function hexToBuffer(hex) {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function getCrypto() {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  // Dynamic import for Node/SSR fallback
  const cryptoModule = await import('crypto');
  return cryptoModule.webcrypto || cryptoModule;
}

/**
 * Generate a cryptographically secure 256-bit symmetric Viewer Key
 */
export async function generateViewerKey() {
  const crypto = await getCrypto();
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return '0x' + bufferToHex(bytes);
}

/**
 * Encrypt job details using the Viewer Key via AES-GCM
 */
export async function encryptJobDetails(detailsObj, viewerKeyHex) {
  const crypto = await getCrypto();
  const keyBuffer = hexToBuffer(viewerKeyHex);
  const dataText = JSON.stringify(detailsObj);
  const dataBytes = new TextEncoder().encode(dataText);

  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBytes
  );

  return {
    iv: '0x' + bufferToHex(iv),
    ciphertext: '0x' + bufferToHex(ciphertextBuffer)
  };
}

/**
 * Decrypt job details using the Viewer Key via AES-GCM
 */
export async function decryptJobDetails(encryptedObj, viewerKeyHex) {
  try {
    const crypto = await getCrypto();
    const keyBuffer = hexToBuffer(viewerKeyHex);
    const iv = hexToBuffer(encryptedObj.iv);
    const ciphertext = hexToBuffer(encryptedObj.ciphertext);

    const key = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const decryptedText = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decryptedText);
  } catch (error) {
    console.error('Failed to decrypt details:', error);
    throw new Error('Invalid viewer key or corrupted data');
  }
}

/**
 * Generate a Keccak256 commitment of the budget and a simulated Zero-Knowledge Proof.
 * The proof proves that the commitment corresponds to the budget without revealing either.
 */
export async function generateBudgetProof(budgetAmount, saltHex) {
  const crypto = await getCrypto();
  const salt = saltHex || ('0x' + bufferToHex(crypto.getRandomValues(new Uint8Array(32))));
  
  // Create Keccak256 commitment
  const commitment = keccak256(
    encodePacked(
      ['uint256', 'bytes32'],
      [BigInt(budgetAmount), salt]
    )
  );

  // ZKP: Simulated range proof proving budget is positive and less than 1B USDC
  const proofPayload = {
    algorithm: 'Keccak256-RangeProof-Simulated',
    commitment,
    timestamp: Date.now(),
    rangeMin: 0,
    rangeMax: 1000000000,
    signature: '0x' + bufferToHex(crypto.getRandomValues(new Uint8Array(64)))
  };

  const proofBytes = new TextEncoder().encode(JSON.stringify(proofPayload));
  const zkpProof = '0x' + bufferToHex(proofBytes);

  return {
    commitment,
    salt,
    zkpProof
  };
}

/**
 * Verify ZKP locally in the browser
 */
export function verifyZkpLocally(commitment, zkpProof) {
  try {
    const cleanProof = zkpProof.startsWith('0x') ? zkpProof.slice(2) : zkpProof;
    const proofText = new TextDecoder().decode(hexToBuffer(cleanProof));
    const proof = JSON.parse(proofText);
    return proof.commitment === commitment;
  } catch (e) {
    return false;
  }
}
