import { jsonSchema, paramSchema } from "@/schemas/main.schema";
import type { Env } from "@/types";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

export default new Hono<Env>()
  .post("/", zValidator("json", jsonSchema), (c) => {
    const json = c.req.valid("json");
    return c.json(json);
  })
  .get("/:bar/:baz", zValidator("param", paramSchema), (c) => {
    const param = c.req.valid("param");
    return c.json(param);
  });
