import { z } from "zod";

const envSchema = z
  .object({
    PORT: z.string().or(z.number()).default(3000).pipe(z.coerce.number()),
  })
  .readonly();

const parsedEnv = envSchema.parse(process.env);
Object.assign(process.env, parsedEnv);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
