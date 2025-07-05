import env from "@env";
import mainRouter from "@routes/main.router";
import testRouter from "@routes/test.router";
import type { Env } from "@types";
import type { Serve } from "bun";
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";

const app = new Hono<Env>()
  .use(contextStorage())
  .use(logger())
  .use("*", requestId())
  .basePath("/api")
  .route("/main", mainRouter)
  .route("/test", testRouter);

if (env.NODE_ENV !== "production") showRoutes(app);

export type AppType = typeof app;

export default {
  fetch: app.fetch,
  port: env.PORT,
} satisfies Serve;
