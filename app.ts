import { Hono } from "hono";
import "./env";
import mainRoutes from "./routes/main.routes";

const api = new Hono();
api.route("/main", mainRoutes);

const app = new Hono();
app.route("/api", api);

Bun.serve({
  fetch: app.fetch,
  port: Bun.env.PORT,
});
console.log(`Running at http://localhost:${Bun.env.PORT}`);
