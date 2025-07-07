import memoizeStaleRefresh from "@cache/memoizeStaleRefresh";
import type { Env } from "@types";
import { Hono } from "hono";

const wait = async (ms: number) => {
  return new Promise((resolve) => setTimeout(() => resolve(ms), ms));
};

export default new Hono<Env>().get("/", async (c) => {
  const data = await memoizeStaleRefresh(
    {
      cacheKey: "test",
      cacheTTL: 60,
      lockTTL: 600,
    },
    async function test() {
      await wait(500);
      return { cached: true };
    },
  );
  return c.json(data);
});
