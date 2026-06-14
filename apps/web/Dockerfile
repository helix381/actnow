FROM node:22-alpine

WORKDIR /app

COPY package*.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci
RUN npm install --no-save @rollup/rollup-linux-x64-musl@4.61.1

COPY . .
RUN npm run build --workspace apps/web

EXPOSE 5173

CMD ["npm", "run", "preview", "--workspace", "apps/web", "--", "--host", "0.0.0.0", "--port", "5173"]
