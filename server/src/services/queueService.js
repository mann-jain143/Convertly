import { randomUUID } from 'crypto';

const jobs = new Map();
const queue = [];
let running = false;

async function processQueue() {
  if (running || queue.length === 0) return;
  running = true;
  const job = queue.shift();

  try {
    jobs.set(job.id, { ...jobs.get(job.id), status: 'processing' });
    const results = await job.handler();
    jobs.set(job.id, { ...jobs.get(job.id), status: 'completed', results, finishedAt: Date.now() });
  } catch (error) {
    jobs.set(job.id, { ...jobs.get(job.id), status: 'failed', error: error.message, finishedAt: Date.now() });
  } finally {
    running = false;
    processQueue();
  }
}

export function enqueueJob(handler) {
  const id = randomUUID();
  const record = { id, status: 'queued', createdAt: Date.now(), results: [] };
  jobs.set(id, record);
  queue.push({ id, handler });
  processQueue();
  return record;
}

export function waitForJob(jobId, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      const job = jobs.get(jobId);
      if (!job) {
        clearInterval(timer);
        reject(new Error('Job not found.'));
        return;
      }

      if (job.status === 'completed') {
        clearInterval(timer);
        resolve(job);
        return;
      }

      if (job.status === 'failed') {
        clearInterval(timer);
        reject(new Error(job.error || 'Queue job failed.'));
        return;
      }

      if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        reject(new Error('Queue wait timeout exceeded.'));
      }
    }, 200);
  });
}
