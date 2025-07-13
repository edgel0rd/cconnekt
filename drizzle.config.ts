import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './src/db/local.db',
  },
  verbose: true,
  strict: true,
} satisfies Config;
