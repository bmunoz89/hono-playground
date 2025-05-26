import env from "@env";
import mainRouter from "@routes/main.router";
import testRouter from "@routes/test.router";
import type { Env } from "@types";
import { AsyncLocalStorage } from "async_hooks";
import type { Serve } from "bun";
import { randomUUID } from "crypto";
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { showRoutes } from "hono/dev";

export const asyncLocalStorage = new AsyncLocalStorage<{
  message: string;
}>();

const app = new Hono<Env>()
  .use(contextStorage())
  .use(async (c, next) => {
    c.set("message", randomUUID());
    await asyncLocalStorage.run({ message: randomUUID() }, () => {
      return next();
    });
  })
  .use(async (c, next) => {
    const store = asyncLocalStorage.getStore();
    console.log(c.req.path, "builtin middleware", c.get("message"));
    console.log(c.req.path, "native middleware", store!.message);
    await next();
  })
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
