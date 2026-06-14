FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

COPY . .
RUN npm run build --workspace apps/worker

CMD ["npm", "run", "start", "--workspace", "apps/worker"]
