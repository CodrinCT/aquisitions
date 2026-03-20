import './env.js';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is required');
}

const isDevelopment = (process.env.NODE_ENV || 'development') !== 'production';
const parsedDatabaseUrl = new URL(databaseUrl);
const isNeonLocalHost = ['localhost', '127.0.0.1', 'neon-local'].includes(
	parsedDatabaseUrl.hostname,
);

if (isDevelopment && isNeonLocalHost) {
	const port = parsedDatabaseUrl.port || '5432';

	neonConfig.fetchEndpoint = `http://${parsedDatabaseUrl.hostname}:${port}/sql`;
	neonConfig.useSecureWebSocket = false;
	neonConfig.poolQueryViaFetch = true;
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

export { db, sql };
