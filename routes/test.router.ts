import type { Env } from "@types";
import { Hono } from "hono";

export default new Hono<Env>().get("/", (c) => {
  return c.json({ test: "test" });
});
