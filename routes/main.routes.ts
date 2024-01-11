import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jsonSchema, paramSchema } from "./main.schemas";

const mainRoutes = new Hono();

mainRoutes.post("/", zValidator("json", jsonSchema), (c) => {
  const json = c.req.valid("json");
  return c.json(json);
});

mainRoutes.get("/:bar/:baz", zValidator("param", paramSchema), (c) => {
  const param = c.req.valid("param");
  return c.json(param);
});

export default mainRoutes;
