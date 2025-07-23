import type { Env } from "@/types";
import { getContext } from "hono/context-storage";

export default function logger(message: string, ...rest: unknown[]): void {
  const { requestId } = getContext<Env>().var;
  console.log(new Date().toISOString(), requestId, message, ...rest);
}
