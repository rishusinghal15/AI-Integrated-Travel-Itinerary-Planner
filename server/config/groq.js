const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

function isReasoningModel(modelName = GROQ_MODEL) {
  return modelName.toLowerCase().includes('gpt-oss') || modelName.toLowerCase().includes('reason');
}

function mapGroqErrorCode(status, errorMessage = '') {
  const msg = String(errorMessage).toLowerCase();
  if (status === 401 || status === 403 || msg.includes('api key') || msg.includes('auth')) {
    return 'AUTH_FAILED';
  }
  if (status === 429 || msg.includes('rate limit')) {
    return 'RATE_LIMITED';
  }
  if (
    status === 404 ||
    status === 503 ||
    msg.includes('model') ||
    msg.includes('decommissioned') ||
    msg.includes('deprecated') ||
    msg.includes('not found')
  ) {
    return 'MODEL_UNAVAILABLE';
  }
  return 'UNKNOWN';
}

module.exports = {
  GROQ_MODEL,
  isReasoningModel,
  mapGroqErrorCode
};
