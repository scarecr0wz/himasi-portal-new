import { Hono } from "hono";
import { authMiddleware, requirePermission } from "../lib/auth.js";
import type { AuthVariables } from "../lib/auth.js";
import { prisma as db } from "../lib/db.js";

const adminActivityRouter = new Hono<{ Variables: AuthVariables }>();

// All routes here require auth and 'menu.acara' permission
adminActivityRouter.use("*", authMiddleware, requirePermission("menu.acara"));

// GET all activities
adminActivityRouter.get("/", async (c) => {
  const activities = await db.activity.findMany({
    orderBy: { startAt: "desc" },
    include: {
      departemen: { select: { id: true, title: true } },
      _count: { select: { participations: true } }
    }
  });
  return c.json(activities);
});

// GET departments for the dropdown
adminActivityRouter.get("/departments", async (c) => {
  const depts = await db.departemen.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true }
  });
  return c.json(depts);
});

// GET single activity
adminActivityRouter.get("/:id", async (c) => {
  const { id } = c.req.param();
  const activity = await db.activity.findUnique({
    where: { id },
    include: {
      departemen: { select: { id: true, title: true } },
      participations: {
        include: {
          user: { select: { id: true, name: true, nim: true } }
        },
        orderBy: { participatedAt: "desc" }
      }
    }
  });

  if (!activity) return c.json({ message: "Acara tidak ditemukan" }, 404);
  return c.json(activity);
});

// POST new activity
adminActivityRouter.post("/", async (c) => {
  const body = await c.req.json();
  const { title, desc, startAt, endAt, departemenId, isActive, image } = body;

  const activity = await db.activity.create({
    data: {
      title,
      desc,
      image,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      uploadAt: new Date(),
      isActive: Boolean(isActive),
      departemenId: departemenId || null,
    }
  });

  return c.json(activity, 201);
});

// PUT (update) activity
adminActivityRouter.put("/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const { title, desc, startAt, endAt, departemenId, isActive, image } = body;

  const activity = await db.activity.update({
    where: { id },
    data: {
      title,
      desc,
      image,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      isActive: Boolean(isActive),
      departemenId: departemenId || null,
    }
  });

  return c.json(activity);
});

// DELETE activity
adminActivityRouter.delete("/:id", async (c) => {
  const { id } = c.req.param();
  await db.activity.delete({ where: { id } });
  return c.json({ success: true });
});

// POST add manual participant
adminActivityRouter.post("/:id/participants", async (c) => {
  const { id } = c.req.param();
  const { userId } = await c.req.json();

  if (!userId) return c.json({ message: "userId diperlukan" }, 400);

  // Check if already registered
  const existing = await db.mahasiswaEventParticipation.findUnique({
    where: {
      userId_activityId: {
        userId,
        activityId: id
      }
    }
  });

  if (existing) {
    return c.json({ message: "Mahasiswa ini sudah terdaftar" }, 400);
  }

  const part = await db.mahasiswaEventParticipation.create({
    data: {
      userId,
      activityId: id,
      attended: false,
    },
    include: {
      user: { select: { id: true, name: true, nim: true } }
    }
  });

  return c.json(part, 201);
});

// PUT toggle attendance
adminActivityRouter.put("/:id/participants/:userId/attendance", async (c) => {
  const { id, userId } = c.req.param();
  const { attended } = await c.req.json();

  const part = await db.mahasiswaEventParticipation.update({
    where: {
      userId_activityId: { userId, activityId: id }
    },
    data: { attended: Boolean(attended) }
  });

  return c.json(part);
});

// DELETE remove participant
adminActivityRouter.delete("/:id/participants/:userId", async (c) => {
  const { id, userId } = c.req.param();
  await db.mahasiswaEventParticipation.delete({
    where: {
      userId_activityId: { userId, activityId: id }
    }
  });
  return c.json({ success: true });
});

// GET users for participant dropdown
adminActivityRouter.get("/:id/search-users", async (c) => {
  const query = c.req.query("q") || "";
  if (query.length < 3) return c.json([]);

  const users = await db.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { nim: { contains: query } }
      ]
    },
    take: 10,
    select: { id: true, name: true, nim: true }
  });

  return c.json(users);
});

export default adminActivityRouter;
