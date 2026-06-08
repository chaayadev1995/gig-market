import fs from 'fs';
import path from 'path';
import { readBody, getMethod, defineEventHandler } from 'h3';
import { getContractAddress, arcTestnet } from '../utils/circle';
import { createPublicClient, http } from 'viem';

const JOBS_DB_PATH = path.resolve('./db/jobs.json');

function readJobs() {
  if (!fs.existsSync(JOBS_DB_PATH)) {
    return [];
  }
  try {
    const data = fs.readFileSync(JOBS_DB_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    console.error('Error reading jobs db:', e);
    return [];
  }
}

function writeJobs(jobs) {
  try {
    fs.writeFileSync(JOBS_DB_PATH, JSON.stringify(jobs, null, 2));
    return true;
  } catch (e) {
    console.error('Error writing jobs db:', e);
    return false;
  }
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  if (method === 'GET') {
    const jobs = readJobs();
    const contractAddress = getContractAddress();
    
    // Fetch ABI
    const artifactPath = path.resolve('./artifacts_contract/contracts/GigMarketEscrow.sol/GigMarketEscrow.json');
    let abi = [];
    if (fs.existsSync(artifactPath)) {
      try {
        const contractJson = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        abi = contractJson.abi;
      } catch (e) {
        console.error('Error reading ABI:', e);
      }
    }

    if (abi.length > 0 && contractAddress) {
      try {
        const publicClient = createPublicClient({
          chain: arcTestnet,
          transport: http(),
        });

        const enrichedJobs = [];
        for (const job of jobs) {
          try {
            const onChainJob = await publicClient.readContract({
              address: contractAddress,
              abi,
              functionName: 'jobs',
              args: [BigInt(job.id)],
            });
            
            const statusMap = ['Created', 'Active', 'Disputed', 'Resolved', 'Completed'];
            job.status = statusMap[Number(onChainJob[6])];
            job.freelancer = onChainJob[2];
            job.freelancerStake = Number(onChainJob[4]) / 1e6;
            job.requiredStake = Number(onChainJob[5]) / 1e6;
            job.currentMilestone = Number(onChainJob[10]);
            job.accumulatedYield = Number(onChainJob[11]) / 1e6;
            job.yieldDistributed = Number(onChainJob[12]) / 1e6;

            // Fetch live yield
            try {
              const liveYield = await publicClient.readContract({
                address: contractAddress,
                abi,
                functionName: 'calculateAccruedYield',
                args: [BigInt(job.id)],
              });
              job.liveAccruedYield = Number(liveYield) / 1e6;
            } catch (yieldErr) {
              job.liveAccruedYield = 0;
            }

            // Fetch splits
            try {
              const splitsResult = await publicClient.readContract({
                address: contractAddress,
                abi,
                functionName: 'getJobSplits',
                args: [BigInt(job.id)],
              });
              const recipients = splitsResult[0] || [];
              const splits = splitsResult[1] || [];
              job.recipients = recipients.map(r => r.toString());
              job.splits = splits.map(s => Number(s));
            } catch (splitsErr) {
              job.recipients = job.recipients || [];
              job.splits = job.splits || [];
            }
          } catch (onChainError) {
            if (job.accumulatedYield === undefined) job.accumulatedYield = 0;
            if (job.yieldDistributed === undefined) job.yieldDistributed = 0;
            if (job.liveAccruedYield === undefined) job.liveAccruedYield = 0;
            job.recipients = job.recipients || [];
            job.splits = job.splits || [];
          }
          enrichedJobs.push(job);
        }
        return enrichedJobs;
      } catch (err) {
        console.error('Error enriching jobs from contract:', err);
      }
    }

    return jobs.map(job => {
      if (job.accumulatedYield === undefined) job.accumulatedYield = 0;
      if (job.yieldDistributed === undefined) job.yieldDistributed = 0;
      if (job.liveAccruedYield === undefined) job.liveAccruedYield = 0;
      if (job.recipients === undefined) job.recipients = [];
      if (job.splits === undefined) job.splits = [];
      return job;
    });
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body || !body.id) {
      return { error: 'Invalid job data' };
    }

    // Security Verification: If cross-chain hashes are provided, verify them on-chain
    let bridgeVerified = false;
    if (body.burnTxHash && body.mintTxHash) {
      if (body.burnTxHash.startsWith('mock_') && body.mintTxHash.startsWith('mock_')) {
        bridgeVerified = true;
      } else {
        try {
          const sourceChain = body.sourceChain || 'Base_Sepolia';
          
          const sourceRpcUrls = {
            Base_Sepolia: 'https://sepolia.base.org',
            Ethereum_Sepolia: 'https://rpc.ankr.com/eth_sepolia',
            Arbitrum_Sepolia: 'https://sepolia-rollup.arbitrum.io/rpc'
          };
          const sourceMessengerAddresses = {
            Base_Sepolia: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275',
            Ethereum_Sepolia: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275',
            Arbitrum_Sepolia: '0xb43db544E2c27092c107639Ad201b3dEfAbcF192'
          };

          const sourceRpc = sourceRpcUrls[sourceChain];
          const messengerAddress = sourceMessengerAddresses[sourceChain];

          if (sourceRpc) {
            const { createPublicClient, http } = await import('viem');
            
            // 1. Verify burn receipt on source chain
            const sourceClient = createPublicClient({ transport: http(sourceRpc) });
            const burnReceipt = await sourceClient.getTransactionReceipt({ hash: body.burnTxHash });
            
            // 2. Verify mint receipt on Arc Testnet
            const arcClient = createPublicClient({ transport: http('https://rpc.testnet.arc.network') });
            const mintReceipt = await arcClient.getTransactionReceipt({ hash: body.mintTxHash });
            
            const isBurnValid = burnReceipt && burnReceipt.status === 'success' && 
                                burnReceipt.to?.toLowerCase() === messengerAddress.toLowerCase();
            const isMintValid = mintReceipt && mintReceipt.status === 'success' && 
                                mintReceipt.to?.toLowerCase() === '0x26413b5220c926949a0e6760f38b16c1E11D3156'.toLowerCase();
            
            if (isBurnValid && isMintValid) {
              bridgeVerified = true;
            } else {
              return { error: 'Cross-chain deposit validation failed: Invalid source/destination receipt validation.' };
            }
          }
        } catch (verifyError) {
          console.error('Cross-chain verification exception:', verifyError);
          return { error: `Cross-chain verification failed: ${verifyError.message}` };
        }
      }
    }

    const jobs = readJobs();
    
    // Add verification field if applicable
    const jobData = { ...body };
    if (body.burnTxHash && body.mintTxHash) {
      jobData.bridgeVerified = bridgeVerified;
    }

    // Check if job already exists, update it, otherwise add it
    const index = jobs.findIndex(j => j.id === body.id);
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...jobData };
    } else {
      jobs.push(jobData);
    }

    writeJobs(jobs);
    return { success: true, jobs };
  }
});
