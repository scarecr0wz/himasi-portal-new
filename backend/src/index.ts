import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./routes/auth.js";
import { content } from "./routes/content.js";
import { profile } from "./routes/profile.js";
import { adminCms } from "./routes/admin-cms.js";
import { uploads, serveUploadFile } from "./routes/uploads.js";
import { authMiddleware } from "./lib/auth.js";
import type { AuthVariables } from "./lib/auth.js";

const app = new Hono<{ Variables: AuthVariables }>();

app.use("*", cors({ origin: ["http://localhost:5173", "http://localhost:3000"], credentials: true }));

app.get("/", (c) => c.json({ name: "himasi-portal-api", version: "0.1.0" }));

// Public: serve uploaded files (must be before /api routes so GET is not wrapped by auth)
app.get("/api/uploads/:filename", serveUploadFile);

app.route("/api/auth", auth);
app.route("/api/profile", profile);
app.route("/api", uploads);
app.route("/api", content);
app.route("/api", adminCms);

app.get("/api/me", authMiddleware, (c) => {
  const user = c.get("user");
  return c.json({ user: user ? { id: user.id, name: user.name, nim: user.nim, email: user.email } : null });
});

const port = Number(process.env.PORT) || 3001;
serve({ fetch: app.fetch, port });
console.log(`Server running at http://localhost:${port}`);
