import { Hono } from "hono";
import { authMiddleware, requirePermission } from "../lib/auth.js";
import type { AuthVariables } from "../lib/auth.js";
import { prisma as db } from "../lib/db.js";

const adminEventKasRouter = new Hono<{ Variables: AuthVariables }>();
adminEventKasRouter.use("*", authMiddleware, requirePermission("menu.finance"));

// GET all EventKas
adminEventKasRouter.get("/", async (c) => {
  const events = await db.eventKas.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      transactions: true,
    }
  });

  // Calculate income, expense for each event
  const mapped = events.map(ev => {
    let income = 0;
    let expense = 0;
    ev.transactions.forEach(t => {
      if (t.type === "INCOME") income += Number(t.amount);
      if (t.type === "EXPENSE") expense += Number(t.amount);
    });

    return {
      id: ev.id,
      title: ev.title,
      description: ev.description,
      status: ev.status,
      income,
      expense,
      createdAt: ev.createdAt,
    };
  });

  return c.json(mapped);
});

// POST new EventKas
adminEventKasRouter.post("/", async (c) => {
  const body = await c.req.json();
  const { title, description } = body;
  
  if (!title) {
    return c.json({ message: "Judul kas event wajib diisi" }, 400);
  }

  const newEvent = await db.eventKas.create({
    data: {
      title,
      description,
      status: "OPEN",
    }
  });

  return c.json(newEvent, 201);
});

// GET specific EventKas by ID
adminEventKasRouter.get("/:id", async (c) => {
  const { id } = c.req.param();
  const ev = await db.eventKas.findUnique({
    where: { id },
    include: { transactions: true }
  });

  if (!ev) {
    return c.json({ message: "Event tidak ditemukan" }, 404);
  }

  return c.json(ev);
});

// POST new transaction to EventKas
adminEventKasRouter.post("/:id/transactions", async (c) => {
  const { id } = c.req.param();
  const user = c.get("user");
  const body = await c.req.json();

  const ev = await db.eventKas.findUnique({ where: { id } });
  if (!ev) return c.json({ message: "Event tidak ditemukan" }, 404);
  if (ev.status === "FINALIZED") return c.json({ message: "Event sudah difinalisasi" }, 400);

  const tx = await db.eventKasTransaction.create({
    data: {
      eventKasId: id,
      type: body.type, // "INCOME" or "EXPENSE"
      amount: Number(body.amount),
      description: body.description,
      transactionDate: body.transactionDate ? new Date(body.transactionDate) : new Date(),
      createdBy: user.id
    }
  });

  return c.json(tx, 201);
});

// GET transactions for EventKas
adminEventKasRouter.get("/:id/transactions", async (c) => {
  const { id } = c.req.param();
  const txs = await db.eventKasTransaction.findMany({
    where: { eventKasId: id },
    include: { user: { select: { name: true } } },
    orderBy: { transactionDate: "asc" }
  });

  return c.json(txs);
});

// POST finalize EventKas
adminEventKasRouter.post("/:id/finalize", async (c) => {
  const { id } = c.req.param();
  const user = c.get("user");
  
  const ev = await db.eventKas.findUnique({ 
    where: { id },
    include: { transactions: true }
  });

  if (!ev) return c.json({ message: "Event tidak ditemukan" }, 404);
  if (ev.status === "FINALIZED") return c.json({ message: "Event sudah difinalisasi" }, 400);

  let income = 0;
  let expense = 0;
  ev.transactions.forEach(t => {
    if (t.type === "INCOME") income += Number(t.amount);
    if (t.type === "EXPENSE") expense += Number(t.amount);
  });
  
  const saldo = income - expense;

  // Insert into main finance transactions if there is a saldo
  if (saldo !== 0) {
    await db.financeTransaction.create({
      data: {
        type: saldo > 0 ? "INCOME" : "EXPENSE",
        amount: Math.abs(saldo),
        description: `Sisa Saldo Finalisasi: ${ev.title}`,
        transactionDate: new Date(),
        createdBy: user.id,
      }
    });
  }

  const updated = await db.eventKas.update({
    where: { id },
    data: { status: "FINALIZED" }
  });

  return c.json({ ...updated, saldo });
});

export default adminEventKasRouter;
