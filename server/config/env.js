const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().optional().default('5000').transform((val) => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 5000 : parsed;
  }),
  MONGO_URI: z.string({
    required_error: 'MONGO_URI is required'
  }).min(1, 'MONGO_URI cannot be empty'),
  GROQ_API_KEY: z.string({
    required_error: 'GROQ_API_KEY is required'
  }).min(1, 'GROQ_API_KEY cannot be empty'),
  JWT_SECRET: z.string({
    required_error: 'JWT_SECRET is required'
  }).min(32, 'JWT_SECRET must be at least 32 characters long for security'),
  GROQ_MODEL: z.string().optional().default('openai/gpt-oss-20b'),
  CLIENT_URL: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production' && (!data.CLIENT_URL || data.CLIENT_URL.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'CLIENT_URL is required when NODE_ENV=production',
      path: ['CLIENT_URL']
    });
  }
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('\n❌ Fatal: Environment variable validation failed:');
    const issues = result.error.issues || result.error.errors || [];
    issues.forEach((err) => {
      const variableName = err.path.join('.');
      console.error(`   - ${variableName}: ${err.message}`);
    });
    console.error('\nPlease verify your environment variables. Never commit secrets.\n');
    process.exit(1);
  }
  return result.data;
}

module.exports = {
  validateEnv,
  envSchema
};
