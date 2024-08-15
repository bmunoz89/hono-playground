import { z } from "zod";

export const jsonSchema = z.object({
  foo: z.string(),
  bar: z.number(),
});

export const paramSchema = z.object({
  bar: z.string(),
  baz: z.string().pipe(z.coerce.number()),
});
