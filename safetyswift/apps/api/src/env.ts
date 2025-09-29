import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  MINIO_ENDPOINT: z.string().min(1, 'MINIO_ENDPOINT is required'),
  MINIO_ACCESS_KEY: z.string().min(1, 'MINIO_ACCESS_KEY is required'),
  MINIO_SECRET_KEY: z.string().min(1, 'MINIO_SECRET_KEY is required'),
  MINIO_BUCKET: z.string().min(1, 'MINIO_BUCKET is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  MAIL_HOST: z.string().min(1, 'MAIL_HOST is required'),
  MAIL_PORT: z.coerce.number().min(1, 'MAIL_PORT is required'),
  DEFAULT_LOCALE: z.enum(['en', 'es']).default('en')
});

type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
