import { z } from "zod";

const baseSchema = z.object({
  TZ: z.string().default("UTC"),
  PORT: z
    .string()
    .or(z.number())
    .default(3000)
    .pipe(z.coerce.number().int().min(0).max(65535)),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  REDIS_RETRY_TIMEOUT: z.number().default(1000),
  REDIS_USERNAME: z.string().default("default"),
  REDIS_PASSWORD: z.string().optional(),
});

const redisNodesSchema = z
  .string()
  .transform((value) => JSON.parse(value))
  .pipe(
    z
      .object({
        host: z.string(),
        port: z
          .string()
          .or(z.number())
          .default(26379)
          .pipe(z.coerce.number().int().min(0).max(65535)),
      })
      .array(),
  );

const envSchema = z.discriminatedUnion("REDIS_MODE", [
  z
    .object({
      REDIS_MODE: z.literal("standard"),
      REDIS_HOST: z.string().default("redis"),
      REDIS_PORT: z
        .string()
        .or(z.number())
        .default(6379)
        .pipe(z.coerce.number().int().min(0).max(65535)),
    })
    .merge(baseSchema),
  z
    .object({
      REDIS_MODE: z.literal("sentinel"),
      REDIS_SENTINEL_NODES: redisNodesSchema,
      REDIS_MASTER_NAME: z
        .string()
        .default("mymaster")
        .describe("Can be set/obtained in the chart sentinel.masterSet field"),
    })
    .merge(baseSchema),
  z
    .object({
      REDIS_MODE: z.literal("cluster"),
      REDIS_CLUSTER_NODES: redisNodesSchema,
    })
    .merge(baseSchema),
]);

const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.error("There is an error with the server environment variables");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export default parsedEnv.data;
