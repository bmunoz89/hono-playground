import env from "@env";
import Redis from "ioredis";

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  keepAlive: 30000,
  db: 0,
  // lazyConnect: true,
  connectTimeout: 10000,
  maxRetriesPerRequest: 3,
  enableOfflineQueue: true,
  showFriendlyErrorStack: false,
});

export default redis;
