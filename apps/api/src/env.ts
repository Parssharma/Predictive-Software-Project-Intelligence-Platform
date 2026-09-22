import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z
    .string()
    .url()
    .default('postgresql://postgres:postgres@localhost:5432/ppi_dev'),
  GITHUB_APP_ID: z.string().min(1).default('test-app-id'),
  GITHUB_CLIENT_ID: z.string().min(1).default('test-client-id'),
  GITHUB_CLIENT_SECRET: z.string().min(1).default('test-client-secret'),
  GITHUB_WEBHOOK_SECRET: z.string().min(1).default('test-webhook-secret'),
  JWT_SECRET: z.string().min(16).default('test-super-secret-jwt-key-123456789'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  return result.data;
}

export const env = loadEnv();
