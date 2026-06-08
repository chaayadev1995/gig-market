import assert from 'assert';
import { getGatewayBalance } from '../server/utils/circle.js';
import { getUserProfile, updateUserProfile } from '../server/utils/users.js';
import { privateKeyToAccount } from 'viem/accounts';
import { verifyMessage } from 'viem';

// A mock runner simulating request intercepts and endpoint billing logic locally
async function runTest() {
  console.log('🧪 Starting Phase 9 Integration Test: Gateway Nanopayments & x402...');

  const clientWallet = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Client address
  const freelancerWallet = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // Freelancer address
  
  // 1. Database Upgrade test
  console.log('\nStep 1: Database Account Initialization...');
  const initialProfile = getUserProfile(clientWallet);
  console.log(`Initial Gateway Balance for client: ${initialProfile.gatewayBalance} USDC`);
  
  // Fund the client's Gateway Balance
  console.log('Depositing 10.00 USDC into client Gateway channel...');
  updateUserProfile(clientWallet, { gatewayBalance: 10.00 });
  const updatedProfile = getUserProfile(clientWallet);
  assert.strictEqual(updatedProfile.gatewayBalance, 10.00, 'Gateway balance update failed');
  console.log(`Updated client Gateway Balance: ${updatedProfile.gatewayBalance} USDC`);

  // Ensure freelancer starts clean
  updateUserProfile(freelancerWallet, { accumulatedMicropayments: 0.0 });
  const freeProfile = getUserProfile(freelancerWallet);
  assert.strictEqual(freeProfile.accumulatedMicropayments, 0.0);

  // 2. Gateway Balance Check utility test
  console.log('\nStep 2: Balance checks utility verification...');
  const val = await getGatewayBalance(clientWallet);
  console.log(`Verified balance from getGatewayBalance helper: ${val} USDC`);
  assert.strictEqual(val, 10.00, 'Gateway balance helper did not return local fallback value');

  // 3. Simulating x402 Handshake
  console.log('\nStep 3: Simulating x402 payment challenge...');
  // Challenge parameters
  const targetPrice = 0.05; // 0.05 USDC per action
  const challenge = 'challenge_test_' + Date.now();
  console.log(`Generated payment required challenge: ${challenge}`);

  // Client private key to sign the challenge (Standard hardhat address 0)
  const clientPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const account = privateKeyToAccount(clientPrivateKey);
  
  console.log(`Client signing challenge hash via private key...`);
  const signature = await account.signMessage({
    message: challenge
  });
  console.log(`Generated Signature: ${signature}`);

  // Verify signature validity (simulating server verification)
  const isValid = await verifyMessage({
    address: clientWallet,
    message: challenge,
    signature: signature
  });
  assert.strictEqual(isValid, true, 'Cryptographic signature verification failed');
  console.log('Cryptographic signature verification passed on server simulation.');

  // 4. Processing Micropayment Billing
  console.log('\nStep 4: Executing micro-accounting balance updates...');
  const amount = targetPrice;
  
  const clientBefore = getUserProfile(clientWallet);
  const freelancerBefore = getUserProfile(freelancerWallet);

  assert(clientBefore.gatewayBalance >= amount, 'Client balance insufficient for charge');

  const newClientBal = parseFloat((clientBefore.gatewayBalance - amount).toFixed(6));
  const newFreelancerEarnings = parseFloat(((freelancerBefore.accumulatedMicropayments || 0) + amount).toFixed(6));

  updateUserProfile(clientWallet, { gatewayBalance: newClientBal });
  updateUserProfile(freelancerWallet, { accumulatedMicropayments: newFreelancerEarnings });

  const clientAfter = getUserProfile(clientWallet);
  const freelancerAfter = getUserProfile(freelancerWallet);

  console.log(`Client Balance: ${clientBefore.gatewayBalance} USDC -> ${clientAfter.gatewayBalance} USDC`);
  console.log(`Freelancer Accumulated Earnings: ${freelancerBefore.accumulatedMicropayments} USDC -> ${freelancerAfter.accumulatedMicropayments} USDC`);

  assert.strictEqual(clientAfter.gatewayBalance, 9.95, 'Client balance deduction incorrect');
  assert.strictEqual(freelancerAfter.accumulatedMicropayments, 0.05, 'Freelancer credit incorrect');

  // 5. Withdrawal settlement
  console.log('\nStep 5: Testing freelancer micropayment withdrawal settlement...');
  const withdrawAmount = freelancerAfter.accumulatedMicropayments;
  console.log(`Freelancer requests settlement of accumulated earnings: ${withdrawAmount} USDC`);
  
  // Reset local database values after settlement simulation
  updateUserProfile(freelancerWallet, { accumulatedMicropayments: 0.0 });
  const freelancerFinal = getUserProfile(freelancerWallet);
  assert.strictEqual(freelancerFinal.accumulatedMicropayments, 0.0, 'Freelancer balance was not zeroed out');
  console.log(`Settled! Freelancer new database balance: ${freelancerFinal.accumulatedMicropayments} USDC`);

  console.log('\n🎉 All Phase 9 logic checks passed successfully!');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
