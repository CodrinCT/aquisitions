import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';
const projectRoot = process.cwd();
const envFiles = [
  `.env.${nodeEnv}.local`,
  `.env.${nodeEnv}`,
  '.env.local',
  '.env',
];

for (const file of envFiles) {
  const filePath = path.join(projectRoot, file);

  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override: false });
  }
}
