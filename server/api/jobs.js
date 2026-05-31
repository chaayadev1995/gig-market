import fs from 'fs';
import path from 'path';
import { readBody, getMethod } from 'h3';

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
    return readJobs();
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body || !body.id) {
      return { error: 'Invalid job data' };
    }

    const jobs = readJobs();
    
    // Check if job already exists, update it, otherwise add it
    const index = jobs.findIndex(j => j.id === body.id);
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...body };
    } else {
      jobs.push(body);
    }

    writeJobs(jobs);
    return { success: true, jobs };
  }
});
