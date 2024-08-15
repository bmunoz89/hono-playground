import env from "@env";
import mainRouter from "@routes/main.router";
import testRouter from "@routes/test.router";
import type { Serve } from "bun";
import { Hono } from "hono";
import { showRoutes } from "hono/dev";

const app = new Hono()
  .basePath("/api")
  .route("/main", mainRouter)
  .route("/test", testRouter);

if (env.NODE_ENV !== "production") {
  showRoutes(app);
}

export type AppType = typeof app;

export default {
  fetch: app.fetch,
  port: env.PORT,
} satisfies Serve;
