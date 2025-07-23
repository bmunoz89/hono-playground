import env from "@/env";
import mainRouter from "@/routes/main.router";
import memoizeRouter from "@/routes/memoize.router";
import testRouter from "@/routes/test.router";
import type { Env } from "@/types";
import logger from "@/utils/logger";
import type { Serve } from "bun";
import { Hono } from "hono";
import { contextStorage as honoContextStorage } from "hono/context-storage";
import { showRoutes } from "hono/dev";
import { logger as honoLogger } from "hono/logger";
import { requestId as honoRequestId } from "hono/request-id";

const app = new Hono<Env>()
  .use(honoContextStorage())
  .use("*", honoRequestId())
  .use(honoLogger(logger))
  .basePath("/api")
  .route("/main", mainRouter)
  .route("/memoize", memoizeRouter)
  .route("/test", testRouter);

if (env.NODE_ENV !== "production") showRoutes(app);

export type AppType = typeof app;

export default {
  fetch: app.fetch,
  port: env.PORT,
} satisfies Serve;
