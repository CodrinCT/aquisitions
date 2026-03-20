# syntax=docker/dockerfile:1

FROM node:22-slim AS base
WORKDIR /app
COPY package*.json ./

FROM base AS development
ENV NODE_ENV=development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS tooling
ENV NODE_ENV=development
RUN npm ci
COPY . .
CMD ["npm", "run", "db:migrate"]

FROM base AS production
ENV NODE_ENV=production
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
