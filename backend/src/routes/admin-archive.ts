import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, requirePermission } from "../lib/auth.js";
import { prisma } from "../lib/db.js";
import type { AuthVariables } from "../lib/auth.js";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const adminArchive = new Hono<{ Variables: AuthVariables }>();

// Base permission check for archive (assuming menu.archive or archive.view is used in the plan)
// For MVP we just use authMiddleware. Proper granular permission can be added if seeds exist.
adminArchive.use("*", authMiddleware);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.resolve(__dirname, "..", "..", "uploads");

function safeFilename(name: string, mime: string): string {
  const ext = path.extname(name).toLowerCase();
  const allowed = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
  if (allowed.includes(ext)) {
    return `${randomUUID()}${ext}`;
  }
  if (mime === "application/pdf") return `${randomUUID()}.pdf`;
  return `${randomUUID()}.jpg`;
}

// Upload file endpoint for archive
adminArchive.post("/admin/archive/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];
    if (!file || typeof file === "string") {
      return c.json({ message: "File tidak ditemukan." }, 400);
    }

    const f = file as { name?: string; type?: string; size?: number; arrayBuffer: () => Promise<ArrayBuffer> };
    await mkdir(UPLOADS_DIR, { recursive: true });
    
    const filename = safeFilename(f.name ?? "document", f.type ?? "");
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

const archiveSchema = z.object({
  docType: z.string().min(1),
  noSurat: z.string().optional().nullable(),
  fromTo: z.string().optional().nullable(),
  subject: z.string().min(1),
  letterDate: z.string().datetime().optional().nullable(),
  description: z.string().optional().nullable(),
  attachmentPath: z.string().optional().nullable(),
});
const archiveUpdateSchema = archiveSchema.partial();

adminArchive.get("/admin/archive", async (c) => {
  const docType = c.req.query("docType");
  const list = await prisma.archiveDocument.findMany({
    where: docType ? { docType } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });
  return c.json(list);
});

adminArchive.post("/admin/archive", zValidator("json", archiveSchema), async (c) => {
  const body = c.req.valid("json");
  const user = c.get("user");
  
  const created = await prisma.archiveDocument.create({
    data: {
      docType: body.docType,
      noSurat: body.noSurat,
      fromTo: body.fromTo,
      subject: body.subject,
      letterDate: body.letterDate ? new Date(body.letterDate) : null,
      description: body.description,
      attachmentPath: body.attachmentPath,
      createdBy: user.id,
    },
  });
  return c.json(created, 201);
});

adminArchive.put("/admin/archive/:id", zValidator("json", archiveUpdateSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  
  const updated = await prisma.archiveDocument.update({
    where: { id },
    data: {
      ...(body.docType !== undefined && { docType: body.docType }),
      ...(body.noSurat !== undefined && { noSurat: body.noSurat }),
      ...(body.fromTo !== undefined && { fromTo: body.fromTo }),
      ...(body.subject !== undefined && { subject: body.subject }),
      ...(body.letterDate !== undefined && { letterDate: body.letterDate ? new Date(body.letterDate) : null }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.attachmentPath !== undefined && { attachmentPath: body.attachmentPath }),
    },
  });
  return c.json(updated);
});

adminArchive.delete("/admin/archive/:id", async (c) => {
  const id = c.req.param("id");
  await prisma.archiveDocument.delete({ where: { id } });
  return c.json({ ok: true });
});

export { adminArchive };
