import { Hono, type Context } from "hono";
import { authMiddleware, requirePermission } from "../lib/auth.js";
import type { AuthVariables } from "../lib/auth.js";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const app = new Hono<{ Variables: AuthVariables }>();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.resolve(__dirname, "..", "..", "uploads");
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"];

function getExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
  };
  return map[mime] ?? ".jpg";
}

function safeFilename(name: string): string {
  const base = path.basename(name);
  const ext = ALLOWED_EXT.includes(path.extname(base).toLowerCase()) ? path.extname(base).toLowerCase() : ".jpg";
  return `${randomUUID()}${ext}`;
}

// Upload: admin only
app.post("/uploads", authMiddleware, requirePermission("menu.cms.news"), async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"] ?? body["image"];
    if (!file || typeof file === "string") {
      return c.json({ message: "File tidak ditemukan. Gunakan field 'file' atau 'image'." }, 400);
    }

    const f = file as { name?: string; type?: string; size?: number; arrayBuffer: () => Promise<ArrayBuffer> };
    const mime = (f.type ?? "").toLowerCase();
    if (!ALLOWED_TYPES.includes(mime)) {
      return c.json({ message: "Tipe file tidak diizinkan. Gunakan JPEG, PNG, GIF, atau WebP." }, 400);
    }
    if ((f.size ?? 0) > MAX_SIZE) {
      return c.json({ message: "Ukuran file maksimal 10MB." }, 400);
    }

    await mkdir(UPLOADS_DIR, { recursive: true });
    const filename = safeFilename(f.name ?? "image");
    const filepath = path.join(UPLOADS_DIR, filename);
    const buffer = Buffer.from(await f.arrayBuffer());
    await writeFile(filepath, buffer);

    const url = `/api/uploads/${filename}`;
    return c.json({ url, filename }, 201);
  } catch (e) {
    console.error("Upload error:", e);
    return c.json({ message: "Gagal mengunggah file." }, 500);
  }
});

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

/** Public handler: serve uploaded file. Pasang di app utama GET /api/uploads/:filename agar tidak kena auth. */
export async function serveUploadFile(c: Context) {
  const filename = c.req.param("filename");
  if (!filename || filename.includes("..") || filename.includes("/")) {
    return c.json({ message: "Not found" }, 404);
  }
  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    return c.json({ message: "Not found" }, 404);
  }
  const filepath = path.join(UPLOADS_DIR, filename);
  try {
    const buf = await readFile(filepath);
    return c.body(buf, 200, {
      "Content-Type": MIME_BY_EXT[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000",
    });
  } catch {
    return c.json({ message: "Not found" }, 404);
  }
}

// Serve uploaded files (public) - also in sub-app for consistency
app.get("/uploads/:filename", serveUploadFile);

export { app as uploads };
