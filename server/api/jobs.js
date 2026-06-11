import fs from 'fs';
import path from 'path';
import { readBody, getMethod, defineEventHandler } from 'h3';
import { getContractAddress, getAgentEscrow8183Address, arcTestnet } from '../utils/circle';
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
    const agentEscrowAddress = getAgentEscrow8183Address();
    
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

    const agentArtifactPath = path.resolve('./artifacts_contract/contracts/AgentEscrow8183.sol/AgentEscrow8183.json');
    let agentAbi = [];
    if (fs.existsSync(agentArtifactPath)) {
      try {
        const contractJson = JSON.parse(fs.readFileSync(agentArtifactPath, 'utf8'));
        agentAbi = contractJson.abi;
      } catch (e) {
        console.error('Error reading AgentEscrow8183 ABI:', e);
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
          if (job.isAgentic || job.escrowType === 'ERC8183') {
            try {
              if (agentAbi.length > 0 && agentEscrowAddress) {
                const onChainJob = await publicClient.readContract({
                  address: agentEscrowAddress,
                  abi: agentAbi,
                  functionName: 'jobs',
                  args: [BigInt(job.id)],
                });

                const statusMap8183 = ['Open', 'Funded', 'Submitted', 'Completed', 'Rejected'];
                job.status = statusMap8183[Number(onChainJob[6])];
                job.freelancer = onChainJob[1];
                job.client = onChainJob[0];
                job.amount = Number(onChainJob[4]) / 1e6;
                job.expiry = Number(onChainJob[5]);
                job.deliverableHash = onChainJob[7];
              }
            } catch (err) {
              console.error('Error reading on-chain job details from AgentEscrow8183:', err);
            }
          } else {
            try {
              const onChainJob = await publicClient.readContract({
                address: contractAddress,
                abi,
                functionName: 'jobs',
                args: [BigInt(job.id)],
              });
              
              // Query privacy status
              let isPrivate = false;
              let encDetailsStr = '';
              try {
                isPrivate = await publicClient.readContract({
                  address: contractAddress,
                  abi,
                  functionName: 'isPrivateJob',
                  args: [BigInt(job.id)],
                });
                if (isPrivate) {
                  encDetailsStr = await publicClient.readContract({
                    address: contractAddress,
                    abi,
                    functionName: 'jobEncryptedDetails',
                    args: [BigInt(job.id)],
                  });
                }
              } catch (privacyError) {
                console.warn(`[Jobs API] Privacy check failed for Job #${job.id}:`, privacyError.shortMessage || privacyError.message);
              }

              const statusMap = ['Created', 'Active', 'Disputed', 'Resolved', 'Completed', 'AppealPending'];
              job.status = statusMap[Number(onChainJob[6])];
              job.freelancer = onChainJob[2];
              job.isPrivate = isPrivate || job.isPrivate || false;

              // Fetch dispute state details
              try {
                const dsResult = await publicClient.readContract({
                  address: contractAddress,
                  abi,
                  functionName: 'disputeStates',
                  args: [BigInt(job.id)],
                });
                job.dispute = {
                  appealTier: Number(dsResult[0]),
                  ruling: Number(dsResult[1]),
                  resolveTime: Number(dsResult[2]),
                  rulingExecuted: dsResult[3],
                  appealDeadline: Number(dsResult[4]),
                  totalAppealPot: Number(dsResult[5]) / 1e6,
                };
              } catch (dsErr) {
                job.dispute = null;
              }

              if (job.isPrivate) {
                job.budget = 0;
                job.amount = 0;
                if (encDetailsStr) {
                  try {
                    job.encryptedDetails = JSON.parse(encDetailsStr);
                  } catch (e) {
                    // Fallback if already parsed or not JSON
                    job.encryptedDetails = encDetailsStr;
                  }
                }
              } else {
                job.amount = Number(onChainJob[3]) / 1e6;
                job.budget = Number(onChainJob[3]) / 1e6;
              }

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
