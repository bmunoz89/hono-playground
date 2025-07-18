import { z } from "zod";

const envSchema = z
  .object({
    TZ: z.string().default("UTC"),
    PORT: z
      .string()
      .or(z.number())
      .default(3000)
      .pipe(z.coerce.number().int().min(0).max(65535)),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    REDIS_HOST: z.string().ip().default("127.0.0.1"),
    REDIS_PORT: z
      .string()
      .or(z.number())
      .default(6379)
      .pipe(z.coerce.number().int().min(0).max(65535)),
  })
  .readonly();

const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.error("There is an error with the server environment variables");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export default parsedEnv.data;
