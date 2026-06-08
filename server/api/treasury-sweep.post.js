import { defineEventHandler, readBody } from 'h3';
import { getCircleConfigStatus, getContractAddress, arcTestnet } from '../utils/circle';
import { createPublicClient, createWalletClient, http, formatUnits, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const USDC_TOKEN_ADDRESS = '0x3600000000000000000000000000000000000000';

export default defineEventHandler(async (event) => {
  const body = await readBody(event) || {};
  const { reservesAddress } = body;

  const status = getCircleConfigStatus();
  const contractAddress = getContractAddress();
  
  // Set default reserves address to the owner/deployer or configured env variable
  let platformReserves = reservesAddress || process.env.PLATFORM_RESERVES_ADDRESS;
  if (!platformReserves && status.isPrivateKeyConfigured) {
    const account = privateKeyToAccount(process.env.PRIVATE_KEY);
    platformReserves = account.address;
  }
  if (!platformReserves) {
    platformReserves = '0x0000000000000000000000000000000000000000'; // Final fallback
  }

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(),
  });

  const artifactPath = path.resolve('./artifacts_contract/contracts/GigMarketEscrow.sol/GigMarketEscrow.json');
  if (!fs.existsSync(artifactPath)) {
    return {
      success: false,
      error: 'Smart contract artifact not found. Please compile first.'
    };
  }

  const contractJson = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abi = contractJson.abi;

  // 1. Fetch current accumulated platform fees on-chain
  let platformFeesAccumulated = 0n;
  let treasuryAddressOnChain = '0x0000000000000000000000000000000000000000';
  
  try {
    platformFeesAccumulated = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: 'platformFeesAccumulated',
    });
    treasuryAddressOnChain = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: 'treasury',
    });
  } catch (e) {
    console.error('Failed to read contract fees:', e);
  }

  let contractSweepTx = 'None';
  let contractSweepSuccess = false;

  // 2. If there are fees accumulated on the contract, call withdrawFees
  if (platformFeesAccumulated > 0n) {
    console.log(`Sweeping platform fees from contract: ${formatUnits(platformFeesAccumulated, 6)} USDC`);
    
    if (status.mode === 'CIRCLE_DCW') {
      try {
        const { CircleDeveloperControlledWalletsClient } = await import('@circle-fin/developer-controlled-wallets');
        const client = new CircleDeveloperControlledWalletsClient({
          apiKey: process.env.CIRCLE_API_KEY,
          entitySecret: process.env.CIRCLE_ENTITY_SECRET,
        });

        // Query the DCW address to send to
        const walletInfo = await client.getWallet({ id: status.circleWalletId });
        const dcwAddress = walletInfo.wallet?.address;

        if (dcwAddress) {
          const response = await client.createContractExecutionTransaction({
            walletId: process.env.CIRCLE_WALLET_ID,
            contractAddress: contractAddress,
            abiFunctionSignature: 'withdrawFees(address,uint256)',
            abiParameters: [dcwAddress, platformFeesAccumulated.toString()],
            feeLevel: 'MEDIUM',
            idempotencyKey: crypto.randomUUID(),
          });
          contractSweepTx = response.txHash || response.id || 'Pending';
          contractSweepSuccess = true;
        }
      } catch (error) {
        console.error('Failed sweeping contract fees via Circle DCW:', error);
      }
    }

    // Fallback/Local Key Mode
    if (!contractSweepSuccess && status.isPrivateKeyConfigured) {
      try {
        const account = privateKeyToAccount(process.env.PRIVATE_KEY);
        const walletClient = createWalletClient({
          account,
          chain: arcTestnet,
          transport: http(),
        });

        // Determine destination: default to on-chain treasury, or owner account
        const dest = treasuryAddressOnChain !== '0x0000000000000000000000000000000000000000'
          ? treasuryAddressOnChain 
          : account.address;

        const hash = await walletClient.writeContract({
          address: contractAddress,
          abi,
          functionName: 'withdrawFees',
          args: [dest, platformFeesAccumulated],
        });
        contractSweepTx = hash;
        contractSweepSuccess = true;
      } catch (error) {
        console.error('Failed sweeping contract fees via viem fallback:', error);
      }
    }
  }

  // 3. Check treasury wallet balance (Circle DCW or local hot wallet)
  let treasuryBalanceUSDC = '0.00';
  let treasuryAddress = '0x0000000000000000000000000000000000000000';
  let dcwSweepTx = 'None';
  let dcwSweepSuccess = false;

  if (status.mode === 'CIRCLE_DCW') {
    try {
      const { CircleDeveloperControlledWalletsClient } = await import('@circle-fin/developer-controlled-wallets');
      const client = new CircleDeveloperControlledWalletsClient({
        apiKey: process.env.CIRCLE_API_KEY,
        entitySecret: process.env.CIRCLE_ENTITY_SECRET,
      });

      const walletInfo = await client.getWallet({ id: status.circleWalletId });
      treasuryAddress = walletInfo.wallet?.address || treasuryAddress;

      const balances = await client.getWalletTokenBalance({ id: status.circleWalletId });
      const usdcToken = balances.tokenBalances?.find(b => b.token?.symbol === 'USDC');
      treasuryBalanceUSDC = usdcToken?.amount || '0.00';

      const balanceNum = parseFloat(treasuryBalanceUSDC);
      // If balance exceeds threshold (e.g. 1.0 USDC) and reserves address is configured, auto-sweep to reserves
      if (balanceNum > 1.0 && platformReserves !== '0x0000000000000000000000000000000000000000' && platformReserves.toLowerCase() !== treasuryAddress.toLowerCase()) {
        console.log(`Auto-sweeping DCW reserves: ${balanceNum} USDC to ${platformReserves}`);
        // Create transfer transaction from DCW to reserves
        const transferRes = await client.createDeveloperTransaction({
          walletId: process.env.CIRCLE_WALLET_ID,
          tokenId: usdcToken?.token?.id,
          recipientAddress: platformReserves,
          amount: [balanceNum.toFixed(2)],
          feeLevel: 'MEDIUM',
          idempotencyKey: crypto.randomUUID(),
        });
        dcwSweepTx = transferRes.txHash || transferRes.id || 'Pending';
        dcwSweepSuccess = true;
      }
    } catch (e) {
      console.error('Error in DCW treasury balance check/sweep:', e);
    }
  } else if (status.isPrivateKeyConfigured) {
    try {
      const account = privateKeyToAccount(process.env.PRIVATE_KEY);
      treasuryAddress = account.address;

      const usdcBalanceVal = await publicClient.readContract({
        address: USDC_TOKEN_ADDRESS,
        abi: [
          {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'owner', type: 'address' }],
            outputs: [{ name: '', type: 'uint256' }],
          },
        ],
        functionName: 'balanceOf',
        args: [treasuryAddress],
      });
      treasuryBalanceUSDC = parseFloat(formatUnits(usdcBalanceVal, 6)).toFixed(2);
      
      const balanceNum = parseFloat(treasuryBalanceUSDC);
      if (balanceNum > 1.0 && platformReserves !== '0x0000000000000000000000000000000000000000' && platformReserves.toLowerCase() !== treasuryAddress.toLowerCase()) {
        console.log(`Auto-sweeping hot wallet reserves: ${balanceNum} USDC to ${platformReserves}`);
        const walletClient = createWalletClient({
          account,
          chain: arcTestnet,
          transport: http(),
        });

        const hash = await walletClient.writeContract({
          address: USDC_TOKEN_ADDRESS,
          abi: [
            {
              name: 'transfer',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'recipient', type: 'address' },
                { name: 'amount', type: 'uint256' }
              ],
              outputs: [{ name: '', type: 'bool' }],
            }
          ],
          functionName: 'transfer',
          args: [platformReserves, usdcBalanceVal],
        });
        dcwSweepTx = hash;
        dcwSweepSuccess = true;
      }
    } catch (e) {
      console.error('Error in fallback treasury balance check/sweep:', e);
    }
  }

  return {
    success: true,
    platformReserves,
    contractSweep: {
      feesAccumulated: formatUnits(platformFeesAccumulated, 6),
      swept: contractSweepSuccess,
      txHash: contractSweepTx,
    },
    treasuryWallet: {
      address: treasuryAddress,
      balanceUSDC: treasuryBalanceUSDC,
      sweptToReserves: dcwSweepSuccess,
      txHash: dcwSweepTx,
    }
  };
});
