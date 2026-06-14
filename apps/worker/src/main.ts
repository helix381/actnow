import { Queue, Worker, type ConnectionOptions } from "bullmq";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const queueName = process.env.WORKER_QUEUE_NAME ?? "actnow-health";
const parsedRedisUrl = new URL(redisUrl);

const connection: ConnectionOptions = {
  host: parsedRedisUrl.hostname,
  port: Number(parsedRedisUrl.port || 6379),
  username: parsedRedisUrl.username || undefined,
  password: parsedRedisUrl.password || undefined,
  maxRetriesPerRequest: null
};

const queue = new Queue(queueName, { connection });

const worker = new Worker(
  queueName,
  async (job) => {
    console.log(`[worker] processed ${job.name}`, {
      id: job.id,
      data: job.data
    });
  },
  { connection }
);

worker.on("ready", async () => {
  console.log(`[worker] ready queue=${queueName} redis=${redisUrl}`);
  await queue.add("health", { timestamp: new Date().toISOString() });
});

worker.on("failed", (job, error) => {
  console.error("[worker] job failed", { id: job?.id, error });
});

async function shutdown() {
  console.log("[worker] shutting down");
  await worker.close();
  await queue.close();
}

process.on("SIGINT", () => void shutdown().then(() => process.exit(0)));
process.on("SIGTERM", () => void shutdown().then(() => process.exit(0)));
