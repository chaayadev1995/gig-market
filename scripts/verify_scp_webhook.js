import { encodeEventTopics, encodeAbiParameters, parseAbiItem } from 'viem';
import fs from 'fs';
import path from 'path';

// Force bypass for testing
process.env.BYPASS_WEBHOOK_VERIFICATION = 'true';
process.env.NODE_ENV = 'test';

const JOBS_DB_PATH = path.resolve('./db/jobs.json');

async function test() {
  console.log('Starting SCP webhook verification test...');

  // Reset database for deterministic test
  fs.writeFileSync(JOBS_DB_PATH, JSON.stringify([], null, 2));

  // --- 1. Encode JobCreated Event ---
  console.log('Encoding simulated JobCreated event...');
  const createdAbiItem = parseAbiItem('event JobCreated(uint256 indexed jobId, address indexed client, uint256 budget, string repoUrl)');
  const createdTopics = encodeEventTopics({
    abi: [createdAbiItem],
    eventName: 'JobCreated',
    args: {
      jobId: 99n,
      client: '0x9999999999999999999999999999999999999999'
    }
  });
  const createdData = encodeAbiParameters(
    [
      { name: 'budget', type: 'uint256' },
      { name: 'repoUrl', type: 'string' }
    ],
    [
      150000000n, // 150 USDC
      'https://github.com/chaayadev1995/gig-market-test-99'
    ]
  );

  const jobCreatedPayload = {
    subscriptionId: 'sub-created-uuid',
    notificationId: 'notif-created-uuid',
    notificationType: 'contracts.eventLog',
    notification: {
      contractAddress: '0x789b9868eE8B750e30743E44d0E7d32C42eBe4d8',
      blockchain: 'ARC-TESTNET',
      txHash: '0xaaaa567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      eventSignature: 'JobCreated(uint256,address,uint256,string)',
      topics: createdTopics,
      data: createdData
    }
  };

  // --- 2. Encode JobJoined Event ---
  console.log('Encoding simulated JobJoined event...');
  const joinedAbiItem = parseAbiItem('event JobJoined(uint256 indexed jobId, address indexed freelancer, uint256 stakedCollateral)');
  const joinedTopics = encodeEventTopics({
    abi: [joinedAbiItem],
    eventName: 'JobJoined',
    args: {
      jobId: 99n,
      freelancer: '0xfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfd'
    }
  });
  const joinedData = encodeAbiParameters(
    [{ name: 'stakedCollateral', type: 'uint256' }],
    [30000000n] // 30 USDC
  );

  const jobJoinedPayload = {
    subscriptionId: 'sub-joined-uuid',
    notificationId: 'notif-joined-uuid',
    notificationType: 'contracts.eventLog',
    notification: {
      contractAddress: '0x789b9868eE8B750e30743E44d0E7d32C42eBe4d8',
      blockchain: 'ARC-TESTNET',
      txHash: '0xbbbb567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      eventSignature: 'JobJoined(uint256,address,uint256)',
      topics: joinedTopics,
      data: joinedData
    }
  };

  // --- 3. Fire local API requests ---
  // Start dev server if not already running, or we can fetch locally
  const url = 'http://localhost:3000/api/scp-webhook';
  console.log(`Sending JobCreated request to ${url}...`);
  try {
    const resCreated = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-circle-signature': 'dummy-sig',
        'x-circle-key-id': 'dummy-key-id'
      },
      body: JSON.stringify(jobCreatedPayload)
    });

    const statusCreated = resCreated.status;
    const bodyCreated = await resCreated.json();
    console.log(`JobCreated response status: ${statusCreated}`, bodyCreated);

    // Verify database after creation
    let jobs = JSON.parse(fs.readFileSync(JOBS_DB_PATH, 'utf8'));
    console.log('Database state after JobCreated:', JSON.stringify(jobs, null, 2));
    if (jobs.length !== 1 || jobs[0].status !== 'Created' || jobs[0].amount !== 150) {
      throw new Error('Database assertion failed after JobCreated event!');
    }

    console.log(`Sending JobJoined request to ${url}...`);
    const resJoined = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-circle-signature': 'dummy-sig',
        'x-circle-key-id': 'dummy-key-id'
      },
      body: JSON.stringify(jobJoinedPayload)
    });

    const statusJoined = resJoined.status;
    const bodyJoined = await resJoined.json();
    console.log(`JobJoined response status: ${statusJoined}`, bodyJoined);

    // Verify database after join
    jobs = JSON.parse(fs.readFileSync(JOBS_DB_PATH, 'utf8'));
    console.log('Database state after JobJoined:', JSON.stringify(jobs, null, 2));
    if (jobs[0].status !== 'Active' || jobs[0].freelancer?.toLowerCase() !== '0xfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfd' || jobs[0].freelancerStake !== 30) {
      throw new Error('Database assertion failed after JobJoined event!');
    }

    console.log('SUCCESS: Webhook integration test passed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('FAILED: Webhook integration test failed:', err.message);
    process.exit(1);
  }
}

test();
