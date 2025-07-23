import redis from "@/cache/redis";
import redlock, { type Settings } from "@/cache/redlock";

export interface MemoizeFn<R> {
  (): Promise<R>;
}

export interface MemoizeOptions {
  cacheKey: string;
  /** Value in seconds. */
  cacheTTL: number;
  /** Value in milliseconds. */
  lockTTL: number;
  lockSettings?: Settings;
  retryCount?: number;
  /** @default false */
  refreshInBackground?: boolean;
  /** Value in milliseconds. */
  refreshThreshold?: number;
  /**
   * Refresh cache ignoring {@link MemoizeOptions.refreshInBackground} and {@link MemoizeOptions.refreshThreshold}.
   */
  force?: boolean;
}

/** Implementation for a redis cluster. */
export default async function memoize<R>(
  opts: MemoizeOptions,
  fn: MemoizeFn<R>,
): Promise<R> {
  opts.retryCount ??= 0;
  opts.refreshInBackground ??= false;
  opts.refreshThreshold ??= 1000;
  opts.force ??= false;

  const cache = opts.force ? undefined : await redis.get(opts.cacheKey);

  if (opts.refreshInBackground && cache) {
    /** Value is -2 if cache key doesn't exists. */
    const expiresAtUnix = await redis.expiretime(opts.cacheKey);
    /** Transform from Unix to milliseconds. */
    const expiresAt = (expiresAtUnix === -2 ? 0 : expiresAtUnix) * 1000;
    const remainingTime = expiresAt - Date.now();
    if (remainingTime < opts.refreshThreshold) {
      let lock;
      try {
        lock = await redlock.acquire(
          [`${opts.cacheKey}:refresh-in-background:lock`],
          opts.lockTTL,
          {
            // There is no need to wait the acquire release
            retryCount: 0,
          } satisfies Settings,
        );
      } catch (error) {
        // Acquire failed, therefore is being updated in another request
      }

      // If we acquire the lock
      if (lock)
        // Refreshing in background
        memoize(
          {
            ...opts,
            refreshInBackground: false,
            force: true,
          },
          fn,
        ).then(() => {
          // Acquire released since refresh in background is completed
          if (lock?.expiration > Date.now()) return lock.release();
        });
    }
  }

  if (cache) return JSON.parse(cache);

  let lock;
  try {
    lock = await redlock.acquire(
      [`${opts.cacheKey}:lock`],
      opts.lockTTL,
      opts.lockSettings,
    );
  } catch (error) {
    // If gets here the opts.lockSettings.retryCount was exceeded(acquire failed)
  }

  if (!lock || lock.attempts.length > 1) {
    // Acquire released since it's necessary to retry
    if (lock?.expiration > Date.now()) await lock.release();

    // Retrying to memoize, since lock was released it should get the cache
    opts.retryCount++;
    return memoize(
      {
        ...opts,
        refreshInBackground: false,
        force: false,
      },
      fn,
    );
  }

  try {
    const data = await fn();
    await redis.set(opts.cacheKey, JSON.stringify(data), "EX", opts.cacheTTL);
    return data;
  } finally {
    // If the lock is expired is not necessary to release it, otherwise it throws an error
    if (lock.expiration > Date.now()) await lock.release();
  }
}
