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
  const list = await prisma.news.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
  return c.json(list);
});

content.get("/content/departments", async (c) => {
  const list = await prisma.departemen.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
  return c.json(list);
});

content.get("/content/prokers", async (c) => {
  const list = await prisma.proker.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
  return c.json(list);
});

content.get("/content/activities", async (c) => {
  const list = await prisma.activity.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
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

export { content };
