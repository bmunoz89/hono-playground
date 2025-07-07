import type { MemoizeFn, MemoizeOptions } from "@cache/memoize";
import memoize from "@cache/memoize";
import redis from "@cache/redis";
import redlock from "@cache/redlock";

async function refreshInBackground<R>(
  opts: MemoizeOptions,
  fn: MemoizeFn<R>,
): Promise<void> {
  const lock = await redlock.acquire(
    `${opts.cacheKey}:lock-refresh`,
    opts.lockTTL,
  );
  console.log("lock.value :>> ", lock.value);
  if (!lock.value) return;

  try {
    const data = await fn();
    await redis.set(opts.cacheKey, JSON.stringify(data), "EX", opts.cacheTTL);
  } finally {
    await lock.release();
  }
}

export default async function memoizeStaleRefresh<R>(
  opts: MemoizeOptions,
  fn: MemoizeFn<R>,
): Promise<R> {
  const cached = await redis.get(opts.cacheKey);
  if (cached) {
    await refreshInBackground(opts, fn);
    return JSON.parse(cached);
  }

  return await memoize(opts, fn);
}
