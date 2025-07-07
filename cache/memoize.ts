import redis from "@cache/redis";
import redlock from "@cache/redlock";

export interface MemoizeFn<R> {
  (): Promise<R>;
}

export interface MemoizeOptions {
  cacheKey: string;
  /** Value in seconds. */
  cacheTTL: number;
  /** Value in milliseconds. */
  lockTTL: number;
}

export default async function memoize<R>(
  opts: MemoizeOptions,
  fn: MemoizeFn<R>,
): Promise<R> {
  const cache = await redis.get(opts.cacheKey);
  if (cache) return JSON.parse(cache);

  const lock = await redlock.acquire([`${opts.cacheKey}:lock`], opts.lockTTL);

  try {
    const data = await fn();
    await redis.set(opts.cacheKey, JSON.stringify(data), "EX", opts.cacheTTL);
    console.log("return real data", data);
    return data;
  } finally {
    await lock.release();
  }
}
