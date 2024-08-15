import { zValidator } from "@hono/zod-validator";
import { jsonSchema, paramSchema } from "@routes/main.schema";
import { Hono } from "hono";

export default new Hono()
  .post("/", zValidator("json", jsonSchema), (c) => {
    const json = c.req.valid("json");
    return c.json(json);
  })
  .get("/:bar/:baz", zValidator("param", paramSchema), (c) => {
    const param = c.req.valid("param");
    return c.json(param);
  });
