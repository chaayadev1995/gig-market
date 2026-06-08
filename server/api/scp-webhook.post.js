import { defineEventHandler, readRawBody, getHeader } from 'h3';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { decodeEventLog } from 'viem';

const JOBS_DB_PATH = path.resolve('./db/jobs.json');
const publicKeyCache = {};

// Load ABI
let gigMarketEscrowAbi = [];
try {
  const artifactPath = path.resolve('./artifacts_contract/contracts/GigMarketEscrow.sol/GigMarketEscrow.json');
  if (fs.existsSync(artifactPath)) {
    gigMarketEscrowAbi = JSON.parse(fs.readFileSync(artifactPath, 'utf8')).abi;
  }
} catch (e) {
  console.error('[SCP Webhook] Error loading GigMarketEscrow ABI:', e);
}

function readJobs() {
  if (!fs.existsSync(JOBS_DB_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(JOBS_DB_PATH, 'utf8') || '[]');
  } catch (e) {
    console.error('[SCP Webhook] Error reading jobs database:', e);
    return [];
  }
}

function writeJobs(jobs) {
  try {
    fs.writeFileSync(JOBS_DB_PATH, JSON.stringify(jobs, null, 2));
  } catch (e) {
    console.error('[SCP Webhook] Error writing jobs database:', e);
  }
}

async function verifyCircleSignature(rawBody, signatureBase64, keyId) {
  if (!rawBody || !signatureBase64 || !keyId) {
    console.error('[SCP Webhook] Missing rawBody, signature, or keyId for verification.');
    return false;
  }

  // Fallback / Bypass verification for local testing, CI, or mock keys
  const bypassVerification =
    process.env.NODE_ENV === 'test' ||
    !process.env.CIRCLE_API_KEY ||
    process.env.CIRCLE_API_KEY.startsWith('TEST_API_KEY') ||
    process.env.BYPASS_WEBHOOK_VERIFICATION === 'true';

  if (bypassVerification) {
    console.warn('[SCP Webhook] Bypassing signature verification (bypass active or mock environment).');
    return true;
  }

  try {
    let pemPublicKey = publicKeyCache[keyId];
    if (!pemPublicKey) {
      const apiKey = process.env.CIRCLE_API_KEY;
      const isSandbox = apiKey.startsWith('SANDBOX') || apiKey.includes('test') || apiKey.includes('sandbox');
      const baseUrl = isSandbox ? 'https://api-sandbox.circle.com' : 'https://api.circle.com';

      console.log(`[SCP Webhook] Fetching public key for ID: ${keyId} from ${baseUrl}...`);
      const response = await $fetch(`${baseUrl}/v2/notifications/publicKey/${keyId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      pemPublicKey = response.data?.publicKey || response.publicKey;
      if (!pemPublicKey) {
        throw new Error('Public key PEM was not returned by Circle API');
      }
      publicKeyCache[keyId] = pemPublicKey;
      console.log('[SCP Webhook] Cached public key successfully.');
    }

    const verifier = crypto.createVerify('SHA256');
    verifier.update(rawBody);
    
    const isValid = verifier.verify(pemPublicKey, signatureBase64, 'base64');
    return isValid;
  } catch (error) {
    console.error('[SCP Webhook] Cryptographic verification failed:', error.message);
    return false;
  }
}

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event);
  const signature = getHeader(event, 'x-circle-signature');
  const keyId = getHeader(event, 'x-circle-key-id');

  console.log('[SCP Webhook] Received webhook notification. Raw body length:', rawBody ? rawBody.length : 0);

  // Validate request authenticity
  const isAuthorized = await verifyCircleSignature(rawBody, signature, keyId);
  if (!isAuthorized) {
    console.warn('[SCP Webhook] Webhook request signature verification failed.');
    event.node.res.statusCode = 401;
    return { error: 'Unauthorized signature' };
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (e) {
    console.error('[SCP Webhook] Failed to parse request body as JSON:', e);
    event.node.res.statusCode = 400;
    return { error: 'Invalid JSON payload' };
  }

  const { notificationType, notification } = body;
  if (notificationType !== 'contracts.eventLog') {
    console.log(`[SCP Webhook] Ignoring unsupported notificationType: ${notificationType}`);
    return { status: 'ignored', reason: 'unsupported notification type' };
  }

  if (!notification) {
    console.warn('[SCP Webhook] Missing notification data in contracts.eventLog payload.');
    return { status: 'ignored', reason: 'missing notification object' };
  }

  const { contractAddress, eventSignature, topics, data, txHash } = notification;
  console.log(`[SCP Webhook] Processing event log for contract: ${contractAddress}, event: ${eventSignature}, tx: ${txHash}`);

  // Decode event log using viem
  let decoded = null;
  if (gigMarketEscrowAbi.length > 0) {
    try {
      decoded = decodeEventLog({
        abi: gigMarketEscrowAbi,
        data,
        topics,
      });
    } catch (err) {
      console.warn('[SCP Webhook] Could not decode event log with GigMarketEscrow ABI:', err.message);
    }
  } else {
    console.warn('[SCP Webhook] GigMarketEscrow ABI is empty or not loaded. Skipping decode.');
  }

  if (!decoded) {
    return { status: 'skipped', reason: 'failed to decode event' };
  }

  console.log(`[SCP Webhook] Decoded event name: ${decoded.eventName}, args:`, JSON.stringify(decoded.args, (k, v) => typeof v === 'bigint' ? v.toString() : v));

  const jobs = readJobs();

  if (decoded.eventName === 'JobCreated') {
    const { jobId, client, budget, repoUrl } = decoded.args;
    let jobIndex = jobs.findIndex(j => j.repoUrl && j.repoUrl.toLowerCase() === repoUrl.toLowerCase());

    if (jobIndex !== -1) {
      jobs[jobIndex].id = Number(jobId);
      jobs[jobIndex].client = client;
      jobs[jobIndex].amount = Number(budget) / 1e6;
      jobs[jobIndex].status = 'Created';
      console.log(`[SCP Webhook] Updated existing draft job by repoUrl to ID #${jobId}`);
    } else {
      jobIndex = jobs.findIndex(j => Number(j.id) === Number(jobId));
      if (jobIndex !== -1) {
        jobs[jobIndex].client = client;
        jobs[jobIndex].amount = Number(budget) / 1e6;
        jobs[jobIndex].status = 'Created';
        console.log(`[SCP Webhook] Updated existing job by ID #${jobId}`);
      } else {
        // Create new job record
        jobs.push({
          id: Number(jobId),
          client,
          amount: Number(budget) / 1e6,
          repoUrl,
          status: 'Created',
          freelancer: null,
          freelancerStake: 0,
          requiredStake: 0,
          currentMilestone: 0,
          milestones: [
            {
              name: "Milestone 1",
              amount: Number(budget) / 1e6,
              completed: false,
              approved: false
            }
          ]
        });
        console.log(`[SCP Webhook] Created new job record for ID #${jobId}`);
      }
    }
    writeJobs(jobs);
  } else if (decoded.eventName === 'JobJoined') {
    const { jobId, freelancer, stakedCollateral } = decoded.args;
    const jobIndex = jobs.findIndex(j => Number(j.id) === Number(jobId));

    if (jobIndex !== -1) {
      jobs[jobIndex].freelancer = freelancer;
      jobs[jobIndex].freelancerStake = Number(stakedCollateral) / 1e6;
      jobs[jobIndex].status = 'Active';
      writeJobs(jobs);
      console.log(`[SCP Webhook] Freelancer joined Job #${jobId}, status set to Active.`);
    } else {
      console.warn(`[SCP Webhook] Received JobJoined for unknown Job #${jobId}`);
    }
  } else if (decoded.eventName === 'JurorRegistered') {
    const { juror } = decoded.args;
    try {
      const { getUserProfile, updateUserProfile } = await import('../utils/users');
      getUserProfile(juror);
      updateUserProfile(juror, {
        isJuror: true,
        jurorReputation: 100,
        jurorStakes: 0,
        votingHistory: []
      });
      console.log(`[SCP Webhook] Juror ${juror} registered in database.`);
    } catch (e) {
      console.error('[SCP Webhook] Error registering juror in DB:', e);
    }
  } else if (decoded.eventName === 'DisputeVoted') {
    const { jobId, juror, vote } = decoded.args;
    try {
      const { getUserProfile, updateUserProfile } = await import('../utils/users');
      const profile = getUserProfile(juror);
      const currentStakes = profile.jurorStakes || 0;
      const currentHistory = profile.votingHistory || [];
      
      if (!currentHistory.some(h => Number(h.jobId) === Number(jobId))) {
        currentHistory.push({
          jobId: Number(jobId),
          vote: Number(vote),
          wasMajority: null,
          stakeSlashed: 0,
          rewardEarned: 0
        });
      }
      
      updateUserProfile(juror, {
        jurorStakes: currentStakes + 50,
        votingHistory: currentHistory
      });

      const jobIndex = jobs.findIndex(j => Number(j.id) === Number(jobId));
      if (jobIndex !== -1) {
        jobs[jobIndex].status = 'Disputed';
        writeJobs(jobs);
      }
      console.log(`[SCP Webhook] Recorded vote for juror ${juror} on Job #${jobId}.`);
    } catch (e) {
      console.error('[SCP Webhook] Error recording juror vote:', e);
    }
  } else if (decoded.eventName === 'DisputeAppealed') {
    const { jobId, newTier, appellant, appealFee } = decoded.args;
    const jobIndex = jobs.findIndex(j => Number(j.id) === Number(jobId));
    if (jobIndex !== -1) {
      jobs[jobIndex].status = 'Disputed';
      if (!jobs[jobIndex].dispute) {
        jobs[jobIndex].dispute = {};
      }
      jobs[jobIndex].dispute.appealTier = Number(newTier);
      jobs[jobIndex].dispute.totalAppealPot = (jobs[jobIndex].dispute.totalAppealPot || 0) + Number(appealFee) / 1e6;
      writeJobs(jobs);
      console.log(`[SCP Webhook] Dispute Appealed for Job #${jobId}, tier updated to ${newTier}.`);
    }
  } else if (decoded.eventName === 'DisputeResolved') {
    const { jobId, winningOption } = decoded.args;
    const jobIndex = jobs.findIndex(j => Number(j.id) === Number(jobId));
    if (jobIndex !== -1) {
      jobs[jobIndex].status = 'AppealPending';
      if (!jobs[jobIndex].dispute) {
        jobs[jobIndex].dispute = {};
      }
      jobs[jobIndex].dispute.ruling = Number(winningOption);
      jobs[jobIndex].dispute.appealDeadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour
      writeJobs(jobs);
      console.log(`[SCP Webhook] DisputeResolved event processed. Job #${jobId} status is AppealPending.`);
    }
  } else if (decoded.eventName === 'RulingExecuted' || decoded.eventName === 'FinalAppealResolved') {
    const { jobId, ruling } = decoded.args;
    console.log(`[SCP Webhook] Final resolution event ${decoded.eventName} for Job #${jobId}, ruling: ${ruling}`);
    await processFinalSettlement(jobId, ruling);
  } else {
    console.log(`[SCP Webhook] Unhandled event name: ${decoded.eventName}`);
    return { status: 'ignored', event: decoded.eventName };
  }

  return { status: 'success', event: decoded.eventName };
});

async function processFinalSettlement(jobId, finalRuling) {
  const jobs = readJobs();
  const jobIndex = jobs.findIndex(j => Number(j.id) === Number(jobId));
  if (jobIndex !== -1) {
    jobs[jobIndex].status = 'Resolved';
    if (!jobs[jobIndex].dispute) {
      jobs[jobIndex].dispute = {};
    }
    jobs[jobIndex].dispute.ruling = Number(finalRuling);
    jobs[jobIndex].dispute.rulingExecuted = true;
    writeJobs(jobs);
  }

  try {
    const { createPublicClient, http } = await import('viem');
    const { getContractAddress, arcTestnet } = await import('../utils/circle');
    const { readUsers, writeUsers } = await import('../utils/users');
    
    const contractAddress = getContractAddress();
    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http()
    });

    const users = readUsers();

    for (const user of users) {
      if (user.isJuror) {
        const address = user.walletAddress;
        
        const isJurorVal = await publicClient.readContract({
          address: contractAddress,
          abi: gigMarketEscrowAbi,
          functionName: 'isJuror',
          args: [address]
        });
        
        const repVal = await publicClient.readContract({
          address: contractAddress,
          abi: gigMarketEscrowAbi,
          functionName: 'jurorReputation',
          args: [address]
        });

        user.isJuror = isJurorVal;
        user.jurorReputation = Number(repVal);
        
        const history = user.votingHistory || [];
        const jobVoteIndex = history.findIndex(h => Number(h.jobId) === Number(jobId));
        if (jobVoteIndex !== -1) {
          const userVote = history[jobVoteIndex].vote;
          const wasMajority = Number(userVote) === Number(finalRuling);
          history[jobVoteIndex].wasMajority = wasMajority;
          
          if (wasMajority) {
            history[jobVoteIndex].rewardEarned = 10; 
            user.jurorStakes = Math.max(0, (user.jurorStakes || 0) - 50);
          } else {
            history[jobVoteIndex].stakeSlashed = 50;
            user.jurorStakes = Math.max(0, (user.jurorStakes || 0) - 50);
          }
          user.votingHistory = history;
        }
      }
    }
    writeUsers(users);
    console.log(`[SCP Webhook] Juror stats synced from chain for Job #${jobId}`);
  } catch (e) {
    console.error('[SCP Webhook] Error updating juror database records after final resolution:', e);
  }
}
