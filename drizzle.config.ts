import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'mysql' as const,
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'whatsapp',
    password: process.env.DB_PASSWORD || 'whatsapp123',
    database: process.env.DB_NAME || 'whatsapp_bridge',
  },
});
