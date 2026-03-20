# Aquisitions Docker Setup

This project supports two database modes:

- Development uses Neon Local in Docker and creates an ephemeral Neon branch from `PARENT_BRANCH_ID` every time the stack starts.
- Production uses your real Neon Cloud database URL and does not run Neon Local.

## Files

- `Dockerfile`: multi-stage image for development and production.
- `docker-compose.dev.yml`: app container plus Neon Local.
- `docker-compose.prod.yml`: app container plus an optional migration utility, connected to an external Neon Cloud database.
- `.env.development`: local development settings for Neon Local.
- `.env.production`: production settings for Neon Cloud.

## NPM Docker Scripts

Use these shortcuts instead of typing full `docker compose` commands:

- `npm run docker:dev`: start development stack with build.
- `npm run docker:dev:down`: stop development stack.
- `npm run docker:dev:logs`: follow app and Neon Local logs.
- `npm run docker:dev:migrate`: run Drizzle migrations in development.
- `npm run docker:prod`: start production stack in detached mode with build.
- `npm run docker:prod:down`: stop production stack.
- `npm run docker:prod:logs`: follow production app logs.
- `npm run docker:prod:migrate`: run Drizzle migrations in production.

## Development with Neon Local

1. Fill in the Neon values in `.env.development`:

   - `NEON_API_KEY`
   - `NEON_PROJECT_ID`
   - `PARENT_BRANCH_ID`
   - `ARCJET_KEY` if your app requires it

2. Start the stack:

   ```bash
   docker compose --env-file .env.development -f docker-compose.dev.yml up --build
   ```

3. The application will be available at `http://localhost:3000`.

4. Neon Local will listen on `localhost:5432` and the app container will use:

   ```text
   postgresql://neon:npg@neon-local:5432/aquisitions?sslmode=require
   ```

5. If you run the Node app outside Docker while keeping Neon Local in Docker, change the host portion to `localhost`:

   ```text
   postgresql://neon:npg@localhost:5432/aquisitions?sslmode=require
   ```

## Production with Neon Cloud

1. Set the real Neon connection string in `.env.production` or inject it from your secret manager:

   ```text
   DATABASE_URL=postgresql://<user>:<password>@<project>.<region>.aws.neon.tech/<database>?sslmode=require&channel_binding=require
   ```

2. Start the production container:

   ```bash
   docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
   ```

3. The app uses the external Neon Cloud database directly. No local database proxy is started in production.

## How Environment Switching Works

- `src/config/env.js` loads `.env.development` when `NODE_ENV=development`.
- `src/config/env.js` loads `.env.production` when `NODE_ENV=production`.
- Compose also injects the same values through `env_file`, which keeps Docker and local execution aligned.
- `src/config/database.js` detects when `DATABASE_URL` points at `neon-local` or `localhost` and switches the Neon serverless client to the local HTTP endpoint at `/sql`.
- When `DATABASE_URL` points at your `neon.tech` host, the normal Neon Cloud path is used.

## Notes

- Neon Cloud is an external managed database service, so `docker-compose.prod.yml` does not define a database container.
- The `.neon_local/` directory stores branch metadata for Neon Local and is ignored by Git.
- If you need schema changes, run your Drizzle commands with the matching environment file loaded.

### Example migration commands

Development:

```bash
docker compose --env-file .env.development -f docker-compose.dev.yml run --rm migrate
```

Production:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm migrate
```
