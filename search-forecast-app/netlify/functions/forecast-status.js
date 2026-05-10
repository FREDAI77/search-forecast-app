/**
 * GET /api/forecast-status?jobId=xxx
 * Polling risultato job
 */
exports.handler = async (event) => {
  const jobId = event.queryStringParameters?.jobId;
  if (!jobId) return { statusCode: 400, body: JSON.stringify({ error: 'Missing jobId' }) };

  const jobStore = global.__jobStore || (global.__jobStore = new Map());
  const job = jobStore.get(jobId);

  if (!job) return { statusCode: 404, body: JSON.stringify({ error: 'Job not found or expired' }) };

  if (job.status === 'completed') {
    return { statusCode: 200, body: JSON.stringify(job.result) };
  } else if (job.status === 'failed') {
    return { statusCode: 500, body: JSON.stringify({ error: 'Forecast generation failed' }) };
  }

  return { statusCode: 202, body: JSON.stringify({ status: job.status, estimatedTime: '10-20s' }) };
};