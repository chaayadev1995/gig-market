import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { readBody } from 'h3';
import { executeEscrowApproval, getContractAddress } from '../utils/circle';

const JOBS_DB_PATH = path.resolve('./db/jobs.json');

function findJobByRepo(repoName) {
  if (!fs.existsSync(JOBS_DB_PATH)) return null;
  try {
    const jobs = JSON.parse(fs.readFileSync(JOBS_DB_PATH, 'utf8'));
    // Find active jobs matching repoName
    return jobs.find(j => {
      const jobRepo = j.repoUrl.toLowerCase();
      return jobRepo.includes(repoName.toLowerCase()) && j.status !== 'Completed' && j.status !== 'Resolved';
    });
  } catch (e) {
    console.error('Error reading jobs database:', e);
    return null;
  }
}

function updateJobMilestone(jobId, milestoneIndex, txHash, scpTransactionId = null) {
  if (!fs.existsSync(JOBS_DB_PATH)) return;
  try {
    const jobs = JSON.parse(fs.readFileSync(JOBS_DB_PATH, 'utf8'));
    const index = jobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      const job = jobs[index];
      if (job.milestones && job.milestones[milestoneIndex]) {
        job.milestones[milestoneIndex].completed = true;
        job.milestones[milestoneIndex].approved = true;
        job.milestones[milestoneIndex].txHash = txHash;
        if (scpTransactionId) {
          job.milestones[milestoneIndex].scpTransactionId = scpTransactionId;
        }
      }
      if (scpTransactionId) {
        job.scpTransactionId = scpTransactionId;
      }
      job.currentMilestone = parseInt(job.currentMilestone || 0) + 1;
      if (job.currentMilestone >= job.milestones.length) {
        job.status = 'Completed';
      }
      fs.writeFileSync(JOBS_DB_PATH, JSON.stringify(jobs, null, 2));
      console.log(`Updated local job database for Job #${jobId}, Milestone ${milestoneIndex} with scpTransactionId: ${scpTransactionId}`);
    }
  } catch (e) {
    console.error('Error updating job database:', e);
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log('GitHub webhook received payload:', JSON.stringify(body, null, 2));

  // 1. Check if it's a Simulated / Direct Test webhook from our Front-End
  if (body && body.isSimulation) {
    const { jobId, milestoneIndex } = body;
    if (jobId === undefined || milestoneIndex === undefined) {
      return { error: 'Simulation payload requires jobId and milestoneIndex' };
    }

    try {
      const result = await executeEscrowApproval(parseInt(jobId), parseInt(milestoneIndex));
      const scpTxId = result.transactionId || result.scpTransactionId || null;
      updateJobMilestone(parseInt(jobId), parseInt(milestoneIndex), result.txHash, scpTxId);
      return {
        success: true,
        message: 'Simulated Git Merge auto-payout triggered successfully!',
        txHash: result.txHash,
        mode: result.mode,
        scpTransactionId: scpTxId,
      };
    } catch (e) {
      console.error('Simulation execution failed:', e);
      return { error: e.message || 'Auto-payout execution failed' };
    }
  }

  // 2. Real GitHub Webhook handler
  // Check if it is a Pull Request Merge event
  // GitHub sends pull_request event, check action and merged
  const githubEvent = event.node.req.headers['x-github-event'];
  const githubSignature = event.node.req.headers['x-hub-signature-256'];
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  // Validate webhook signature if secret is configured
  if (webhookSecret && githubSignature) {
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = 'sha256=' + hmac.update(JSON.stringify(body)).digest('hex');
    if (githubSignature !== digest) {
      return { error: 'Invalid signature verification failed' };
    }
  }

  if (githubEvent === 'pull_request') {
    const action = body.action;
    const isMerged = body.pull_request?.merged;
    const repoFullName = body.repository?.full_name; // e.g. "owner/repo"

    if (action === 'closed' && isMerged) {
      console.log(`Verified merged PR on repository: ${repoFullName}`);
      
      // Look up corresponding job in database
      const job = findJobByRepo(repoFullName);
      if (!job) {
        return { message: `No active GigMarket job mapped to repository ${repoFullName}` };
      }

      const jobId = job.id;
      const currentMilestoneIndex = job.currentMilestone || 0;

      console.log(`Match found! Job #${jobId}, executing milestone ${currentMilestoneIndex} payout.`);

      try {
        const result = await executeEscrowApproval(jobId, currentMilestoneIndex);
        const scpTxId = result.transactionId || result.scpTransactionId || null;
        updateJobMilestone(jobId, currentMilestoneIndex, result.txHash, scpTxId);
        return {
          success: true,
          message: `Escrow payout transaction sent: ${result.txHash}`,
          txHash: result.txHash,
          scpTransactionId: scpTxId,
        };
      } catch (e) {
        console.error('Smart contract payout invocation failed:', e);
        return { error: `On-chain execution failed: ${e.message}` };
      }
    }
  }

  return { message: 'Webhook event processed (no merge actions triggered).' };
});
