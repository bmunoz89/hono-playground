import redis from "@/cache/redis";
import Redlock from "redlock";

export interface Settings {
  /**
   * The expected clock drift.
   *
   * Multiplied by lock ttl to determine drift time.
   *
   * @see http://redis.io/topics/distlock
   * @default 0.01
   */
  readonly driftFactor?: number;
  /**
   * The max number of times Redlock will attempt to lock a resource before erroring.
   *
   * @default 10
   */
  readonly retryCount?: number;
  /**
   * The time in ms between attempts.
   *
   * @default 200
   */
  readonly retryDelay?: number;
  /**
   * The max time in ms randomly added to retries to improve performance under high contention.
   *
   * @see https://www.awsarchitectureblog.com/2015/03/backoff.html
   * @default 100
   */
  readonly retryJitter?: number;
  /**
   * The minimum remaining time on a lock before an extension is automatically attempted with the `using` API.
   *
   * @default 500
   */
  readonly automaticExtensionThreshold?: number;
}

const redlock = new Redlock(
  // You should have one client for each independent redis node
  // or cluster.
  [redis],
  {
    driftFactor: 0.01,
    retryCount: 10,
    retryDelay: 200,
    retryJitter: 100,
    automaticExtensionThreshold: 500,
  } satisfies Settings,
);

export default redlock;
