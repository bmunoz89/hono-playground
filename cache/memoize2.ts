import type { MemoizeFn, MemoizeOptions } from "@cache/memoize";
import redis from "@cache/redis";

export default async function memoize2<R>(
  opts: MemoizeOptions,
  fn: MemoizeFn<R>,
): Promise<R> {
  const cached = await redis.get(opts.cacheKey);
  if (cached) return JSON.parse(cached);

  const lockKey = `${opts.cacheKey}:lock`;

  const acquired = await redis.set(lockKey, "locked", "NX");

  if (!acquired) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return memoize2(opts, fn);
  }

  try {
    const data = await fn();
    await redis.set(opts.cacheKey, JSON.stringify(data), "EX", opts.cacheTTL);
    return data;
  } finally {
    await redis.del(lockKey);
  }
}
