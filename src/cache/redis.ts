import env from "@/env";
import { redis } from "bun";
import Redis, { Cluster } from "ioredis";

let redis: Redis | Cluster;
switch (env.REDIS_MODE) {
  case "standard":
    redis = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      username: env.REDIS_USERNAME,
      password: env.REDIS_PASSWORD,
      enableAutoPipelining: true,
    });
    break;
  case "sentinel":
    redis = new Redis({
      name: env.REDIS_MASTER_NAME,
      sentinels: env.REDIS_SENTINEL_NODES,
      username: env.REDIS_USERNAME,
      password: env.REDIS_PASSWORD,
      sentinelUsername: env.REDIS_USERNAME,
      sentinelPassword: env.REDIS_PASSWORD,
      enableAutoPipelining: true,
    });
    break;
  case "cluster":
    // NOT WORKING - Getting error when connecting to pods
    // Unhandled error event: Error: Failed to refresh slots cache
    redis = new Cluster(env.REDIS_CLUSTER_NODES, {
      // dnsLookup: (address, callback) => callback(null, address),
      redisOptions: {
        // tls: {},
        username: env.REDIS_USERNAME,
        password: env.REDIS_PASSWORD,
      },
      scaleReads: "slave",
      enableAutoPipelining: true,
    });
    break;
}

export function isCluster(redis: Redis | Cluster): redis is Cluster {
  return redis.isCluster;
}

export default redis;
