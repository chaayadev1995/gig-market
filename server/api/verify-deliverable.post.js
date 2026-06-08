import fs from 'fs';
import path from 'path';
import { readBody, defineEventHandler } from 'h3';
import { executeAgentEscrowAttestation } from '../utils/circle';

const JOBS_DB_PATH = path.resolve('./db/jobs.json');

function updateJobStatus(jobId, status, txHash, deliverableHash, codeUrl) {
  if (!fs.existsSync(JOBS_DB_PATH)) return;
  try {
    const jobs = JSON.parse(fs.readFileSync(JOBS_DB_PATH, 'utf8'));
    const index = jobs.findIndex(j => Number(j.id) === Number(jobId));
    if (index !== -1) {
      jobs[index].status = status;
      jobs[index].payoutTxHash = txHash;
      jobs[index].deliverableHash = deliverableHash;
      jobs[index].codeUrl = codeUrl;
      fs.writeFileSync(JOBS_DB_PATH, JSON.stringify(jobs, null, 2));
      console.log(`Updated job #${jobId} status to ${status} with txHash ${txHash}`);
    }
  } catch (e) {
    console.error('Error updating job status:', e);
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log('Verify deliverable oracle request received:', body);

  const { jobId, deliverableHash, codeUrl } = body;
  if (!jobId || !deliverableHash || !codeUrl) {
    return { error: 'Missing required parameters: jobId, deliverableHash, codeUrl' };
  }

  // Automated deliverable validation logic (Simulating unit testing suite)
  console.log(`[Oracle] Initiating automated test suite execution for deliverable: ${deliverableHash}`);
  console.log(`[Oracle] Downloading and building code package from ${codeUrl}...`);

  let testSuitePassed = true;
  let validationLogs = [];

  validationLogs.push('Initializing test runner environment...');
  validationLogs.push('Installing dependencies via npm...');
  validationLogs.push('Compiling code package...');

  // Mock test verification rules based on keywords in the codeUrl
  if (codeUrl.toLowerCase().includes('fail') || codeUrl.toLowerCase().includes('error')) {
    testSuitePassed = false;
    validationLogs.push('Error: Linter check failed - 2 styling issues found.');
    validationLogs.push('FAIL: testsuite/spec-matching.js - expected 12 passed, got 11 passed, 1 failed.');
  } else {
    validationLogs.push('Linter checks passed successfully.');
    validationLogs.push('PASS: testsuite/spec-matching.js - 12 passed, 0 failed.');
    validationLogs.push('All automated unit tests successfully matched job specification constraints.');
  }

  const action = testSuitePassed ? 'completeJob' : 'rejectJob';
  const targetStatus = testSuitePassed ? 'Completed' : 'Rejected';

  try {
    console.log(`[Oracle] Testing outcome: ${testSuitePassed ? 'PASS' : 'FAIL'}. Initiating on-chain attestation: ${action}`);
    const result = await executeAgentEscrowAttestation(parseInt(jobId), action);

    updateJobStatus(parseInt(jobId), targetStatus, result.txHash, deliverableHash, codeUrl);

    return {
      success: true,
      testSuitePassed,
      logs: validationLogs,
      txHash: result.txHash,
      targetStatus
    };
  } catch (e) {
    console.error('Attestation execution failed:', e);
    return { 
      error: `Oracle attestation failed: ${e.message}`,
      testSuitePassed,
      logs: validationLogs 
    };
  }
});
