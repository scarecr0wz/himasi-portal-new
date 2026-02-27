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

content.get("/content/prokers", async (c) => {
  const list = await prisma.proker.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: { createdAt: "desc" },
    include: { departemen: { select: { id: true, title: true } } },
  });
  return c.json(list);
});

content.get("/content/activities", async (c) => {
  const list = await prisma.activity.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: { startAt: "desc" },
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

export { content };
