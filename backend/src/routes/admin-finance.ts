import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, requirePermission } from "../lib/auth.js";
import type { AuthVariables } from "../lib/auth.js";
import { prisma } from "../lib/db.js";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.resolve(__dirname, "..", "..", "uploads");

function safeFilename(name: string, mime: string): string {
  const ext = path.extname(name).toLowerCase();
  const allowed = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
  if (allowed.includes(ext)) return `${randomUUID()}${ext}`;
  if (mime === "application/pdf") return `${randomUUID()}.pdf`;
  return `${randomUUID()}.jpg`;
}

const app = new Hono<{ Variables: AuthVariables }>();

app.use("*", authMiddleware, requirePermission("menu.finance"));

// POST upload evidence file
app.post("/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];
    if (!file || typeof file === "string") {
      return c.json({ message: "File tidak ditemukan." }, 400);
    }
    const f = file as { name?: string; type?: string; arrayBuffer: () => Promise<ArrayBuffer> };
    await mkdir(UPLOADS_DIR, { recursive: true });
    const filename = safeFilename(f.name ?? "evidence", f.type ?? "");
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

// GET summary
app.get("/summary", async (c) => {
  const from = c.req.query("from");
  const to = c.req.query("to");

  let dateFilter = {};
  if (from || to) {
    dateFilter = {
      transactionDate: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    };
  }

  const transactions = await prisma.financeTransaction.findMany({
    where: dateFilter,
    select: { type: true, amount: true },
  });

  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of transactions) {
    if (t.type === "INCOME") totalIncome += Number(t.amount);
    if (t.type === "EXPENSE") totalExpense += Number(t.amount);
  }

  return c.json({
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  });
});

// GET list
app.get("/", async (c) => {
  const type = c.req.query("type");
  const categoryId = c.req.query("categoryId");
  const from = c.req.query("from");
  const to = c.req.query("to");

  let where: any = {};
  if (type) where.type = type;
  if (categoryId) where.categoryId = categoryId;
  
  if (from || to) {
    where.transactionDate = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const data = await prisma.financeTransaction.findMany({
    where,
    orderBy: { transactionDate: "desc" },
    include: {
      category: { select: { value: true } },
      user: { select: { name: true } },
    },
  });

  return c.json(data);
});

// POST create
const createSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().uuid().optional().nullable(),
  amount: z.number().positive(),
  description: z.string().optional().nullable(),
  transactionDate: z.string().datetime(),
  evidencePath: z.string().optional().nullable(),
});

app.post("/", zValidator("json", createSchema), async (c) => {
  const payload = c.req.valid("json");
  const user = c.get("user")!;

  const trx = await prisma.financeTransaction.create({
    data: {
      type: payload.type,
      categoryId: payload.categoryId,
      amount: payload.amount,
      description: payload.description,
      transactionDate: new Date(payload.transactionDate),
      evidencePath: payload.evidencePath,
      createdBy: user.id,
    },
  });

  return c.json(trx, 201);
});

// DELETE
app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.financeTransaction.delete({ where: { id } });
    return c.json({ success: true });
  } catch (err) {
    return c.json({ message: "Not found or cannot delete" }, 404);
  }
});

export { app as adminFinance };
