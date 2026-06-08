import { getCircleConfigStatus, getContractAddress, getAgentEscrow8183Address, arcTestnet } from '../utils/circle';
import { createPublicClient, http, formatUnits } from 'viem';
import { getQuery } from 'h3';
import fs from 'fs';
import path from 'path';

const USDC_TOKEN_ADDRESS = '0x3600000000000000000000000000000000000000';

export default defineEventHandler(async (event) => {
  const status = getCircleConfigStatus();
  const contractAddress = getContractAddress();
  const agentEscrowAddress = getAgentEscrow8183Address();

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(),
  });

  let walletAddress = '0x0000000000000000000000000000000000000000';
  let nativeBalance = '0.00';
  let usdcBalance = '0.00';

  if (status.mode === 'LOCAL_KEY_FALLBACK') {
    // If local private key configured, get its address and balance
    if (status.isPrivateKeyConfigured) {
      try {
        const { privateKeyToAccount } = await import('viem/accounts');
        const account = privateKeyToAccount(process.env.PRIVATE_KEY);
        walletAddress = account.address;

        // Native gas is USDC on Arc (18 decimals for native value)
        const balanceWei = await publicClient.getBalance({ address: walletAddress });
        nativeBalance = parseFloat(formatUnits(balanceWei, 18)).toFixed(4);

        // Fetch ERC-20 USDC balance (6 decimals)
        const artifactPath = path.resolve('./artifacts_contract/contracts/GigMarketEscrow.sol/GigMarketEscrow.json');
        if (fs.existsSync(artifactPath)) {
          const contractJson = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
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
            args: [walletAddress],
          });
          usdcBalance = parseFloat(formatUnits(usdcBalanceVal, 6)).toFixed(2);
        }
      } catch (e) {
        console.error('Error fetching fallback balance:', e);
      }
    }
  } else {
    // Circle mode: we can list wallets to get the address or use the configured wallet
    walletAddress = status.circleWalletId || 'Circle Wallet ID Not Found';
    // For simplicity, we can fetch balance via Circle client
    try {
      const { CircleDeveloperControlledWalletsClient } = await import('@circle-fin/developer-controlled-wallets');
      const client = new CircleDeveloperControlledWalletsClient({
        apiKey: process.env.CIRCLE_API_KEY,
        entitySecret: process.env.CIRCLE_ENTITY_SECRET,
      });

      const walletInfo = await client.getWallet({ id: status.circleWalletId });
      walletAddress = walletInfo.wallet?.address || walletAddress;

      const balances = await client.getWalletTokenBalance({ id: status.circleWalletId });
      const usdcToken = balances.tokenBalances?.find(b => b.token?.symbol === 'USDC');
      usdcBalance = usdcToken?.amount || '0.00';
      nativeBalance = usdcBalance; // Native gas is USDC on Arc
    } catch (e) {
      console.error('Error fetching Circle balance:', e);
    }
  }

  const query = getQuery(event);
  const profileAddress = query.walletAddress;
  let profile = null;
  if (profileAddress) {
    const { getUserProfile } = await import('../utils/users');
    profile = getUserProfile(profileAddress);
  }

  return {
    circleStatus: status,
    contractAddress,
    agentEscrowAddress,
    walletAddress,
    kitKey: process.env.KIT_KEY || '',
    balances: {
      native: nativeBalance,
      usdc: usdcBalance,
      symbol: 'USDC',
    },
    profile,
  };
});
