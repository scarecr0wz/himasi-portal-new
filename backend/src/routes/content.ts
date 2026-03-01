import { Hono } from "hono";
import { authMiddleware, requirePermission } from "../lib/auth.js";
import { prisma } from "../lib/db.js";

// Content/landing routes - aligned with backend-web-himasi /content/* and protected CMS routes
const content = new Hono();

content.get("/content/benefits", async (c) => {
  const list = await prisma.benefit.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
  return c.json(list);
});

content.get("/content/news", async (c) => {
  const list = await prisma.news.findMany({
    where: { deletedAt: null, isActive: true, cancelledAt: null },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
  return c.json(list);
});

content.get("/content/news/slug/:slug", async (c) => {
  const slug = c.req.param("slug");
  const news = await prisma.news.findFirst({
    where: { slug, deletedAt: null, isActive: true, cancelledAt: null },
  });
  if (!news) return c.json({ message: "Berita tidak ditemukan" }, 404);
  return c.json(news);
});

content.get("/content/departments", async (c) => {
  const list = await prisma.departemen.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
  return c.json(list);
});

content.get("/content/departments/:id", async (c) => {
  const id = c.req.param("id");
  const dept = await prisma.departemen.findFirst({
    where: { id, deletedAt: null },
  });
  if (!dept) return c.json({ message: "Departemen tidak ditemukan" }, 404);
  return c.json(dept);
});

content.get("/content/prokers", async (c) => {
  const list = await prisma.proker.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: { createdAt: "desc" },
    include: { departemen: { select: { id: true, title: true } } },
  });
  return c.json(list);
});

// 3 acara terbaru mendatang (untuk landing). Harus di atas /content/activities/:id
content.get("/content/activities/upcoming", async (c) => {
  const limit = Math.min(Number(c.req.query("limit")) || 3, 10);
  const now = new Date();
  const list = await prisma.activity.findMany({
    where: { deletedAt: null, isActive: true, startAt: { gte: now } },
    orderBy: { startAt: "asc" },
    take: limit,
    include: { departemen: { select: { id: true, title: true } } },
  });
  return c.json(list);
});

content.get("/content/activities", async (c) => {
  const departemenId = c.req.query("departemenId");
  const where: { deletedAt: null; isActive: true; departemenId?: string | null } = { deletedAt: null, isActive: true };
  if (departemenId && departemenId.trim()) where.departemenId = departemenId.trim();
  const list = await prisma.activity.findMany({
    where,
    orderBy: { startAt: "asc" },
    include: { departemen: { select: { id: true, title: true } } },
  });
  return c.json(list);
});

content.get("/content/activities/:id", async (c) => {
  const id = c.req.param("id");
  const activity = await prisma.activity.findFirst({
    where: { id, deletedAt: null, isActive: true },
    include: { departemen: { select: { id: true, title: true } } },
  });
  if (!activity) return c.json({ message: "Acara tidak ditemukan" }, 404);
  return c.json(activity);
});

content.get("/content/activities/:id/participants", async (c) => {
  const activityId = c.req.param("id");
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, deletedAt: null },
    select: { id: true },
  });
  if (!activity) return c.json({ message: "Acara tidak ditemukan" }, 404);
  const participations = await prisma.mahasiswaEventParticipation.findMany({
    where: { activityId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          nim: true,
          modelHasRoles: { include: { role: { select: { name: true } } } },
        },
      },
    },
    orderBy: { participatedAt: "asc" },
  });
  const ADMIN_ROLES = ["admin", "superadmin"];
  const list = participations.map((p) => {
    const roles = p.user.modelHasRoles?.map((r) => r.role.name) ?? [];
    const isAdmin = roles.some((r) => ADMIN_ROLES.includes(r));
    return {
      userId: p.user.id,
      name: p.user.name,
      nim: p.user.nim,
      isAdmin,
      participatedAt: p.participatedAt,
    };
  });
  return c.json(list);
});

content.get("/content/photos", async (c) => {
  const list = await prisma.photo.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
  return c.json(list);
});

content.get("/content/faqs", async (c) => {
  const list = await prisma.faq.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
  return c.json(list);
});

content.get("/content/pengurus", async (c) => {
  const periode = c.req.query("periode");
  const where: { deletedAt: null; periode?: string } = { deletedAt: null };
  if (periode) where.periode = periode;
  const list = await prisma.pengurus.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { departemen: { select: { id: true, title: true, icon: true } } },
  });
  return c.json(list);
});

content.get("/content/social-media", async (c) => {
  const list = await prisma.socialMedia.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return c.json(list);
});

export { content };
