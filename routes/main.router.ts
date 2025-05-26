import { asyncLocalStorage } from "@app";
import { zValidator } from "@hono/zod-validator";
import { jsonSchema, paramSchema } from "@routes/main.schema";
import type { Env } from "@types";
import { Hono } from "hono";

export default new Hono<Env>()
  .post("/", zValidator("json", jsonSchema), (c) => {
    const json = c.req.valid("json");
    return c.json(json);
  })
  .get("/:bar/:baz", zValidator("param", paramSchema), (c) => {
    const param = c.req.valid("param");
    const store = asyncLocalStorage.getStore();
    console.log(c.req.path, "native endpoint", store!.message);
    console.log(c.req.path, "builtin endpoint", c.get("message"));
    return c.json(param);
  });
