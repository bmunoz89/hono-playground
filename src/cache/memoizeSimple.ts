import type { MemoizeFn, MemoizeOptions } from "@/cache/memoize";
import redis from "@/cache/redis";
import wait from "@/utils/wait";

/** Implementation for a single redis instance. */
export default async function memoizeSimple<R>(
  opts: MemoizeOptions,
  fn: MemoizeFn<R>,
): Promise<R> {
  const cached = await redis.get(opts.cacheKey);
  if (cached) return JSON.parse(cached);

  const lockKey = `${opts.cacheKey}:lock`;

  const acquired = await redis.set(lockKey, "locked", "NX");

  if (!acquired) {
    const retryDelay = opts.lockSettings?.retryDelay ?? 200;
    await wait(retryDelay);
    return memoizeSimple(opts, fn);
  }

  try {
    const data = await fn();
    await redis.set(opts.cacheKey, JSON.stringify(data), "EX", opts.cacheTTL);
    return data;
  } finally {
    await redis.del(lockKey);
  }
}
