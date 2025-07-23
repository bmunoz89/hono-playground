import memoize from "@/cache/memoize";
import type { Env } from "@/types";
import wait from "@/utils/wait";
import { Hono } from "hono";

export default new Hono<Env>()
  .get("/", async (c) => {
    const data = await memoize(
      {
        cacheKey: "memoized",
        cacheTTL: 5,
        lockTTL: 1000,
        lockSettings: {
          retryCount: 10,
          retryDelay: 100,
        },
      },
      async function getData() {
        await wait(400);
        return { cached: true };
      },
    );
    return c.json(data);
  })
  .get("/refresh-in-background", async (c) => {
    const data = await memoize(
      {
        cacheKey: "memoized-refresh-in-background",
        cacheTTL: 5,
        lockTTL: 1000,
        lockSettings: {
          retryCount: 10,
          retryDelay: 100,
        },
        refreshInBackground: true,
        refreshThreshold: 1000,
      },
      async function getData() {
        await wait(400);
        return { cached: true };
      },
    );
    return c.json(data);
  });
