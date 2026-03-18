import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
// import { createPool } from '@neondatabase/serverless';

export default {
  schema: './src/models/*.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
//   driver: async dbCredentials => {
//     const pool = createPool(dbCredentials.url);
//     return drizzle(pool);
//   },
};
