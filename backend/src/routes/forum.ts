import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware } from "../lib/auth.js";
import { prisma } from "../lib/db.js";
import type { AuthVariables } from "../lib/auth.js";

const forum = new Hono<{ Variables: AuthVariables }>();

// Semua route forum butuh login
forum.use("*", authMiddleware);

const createTopicSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
});

const createReplySchema = z.object({
  content: z.string().min(1),
});

// ---------- Kategori (forum_category dari Enumeration) ----------
// Semua anggota yang login bisa akses (tidak pakai permission khusus)
forum.get("/forum/categories", async (c) => {
  const list = await prisma.enumeration.findMany({
    where: { key: "forum_category", deletedAt: null },
    orderBy: { value: "asc" },
    select: { id: true, value: true },
  });
  return c.json(list);
});

// ---------- List topik (filter by categoryId opsional) ----------
forum.get("/forum/topics", async (c) => {
  const categoryId = c.req.query("categoryId")?.trim() || undefined;
  const where: { deletedAt: null; categoryId?: string } = { deletedAt: null };
  if (categoryId) where.categoryId = categoryId;

  const topics = await prisma.forumTopic.findMany({
    where,
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      categoryId: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true, nim: true } },
      category: { select: { id: true, value: true } },
      _count: { select: { replies: true } },
    },
  });

  const list = topics.map((t) => ({
    id: t.id,
    title: t.title,
    categoryId: t.category.id,
    categoryName: t.category.value,
    isPinned: t.isPinned,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    author: { id: t.user.id, name: t.user.name, nim: t.user.nim },
    replyCount: t._count.replies,
  }));

  return c.json(list);
});

// ---------- Detail topik + balasan ----------
forum.get("/forum/topics/:id", async (c) => {
  const id = c.req.param("id");
  const topic = await prisma.forumTopic.findFirst({
    where: { id, deletedAt: null },
    include: {
      user: { select: { id: true, name: true, nim: true, avatar: true } },
      category: { select: { id: true, value: true } },
      replies: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, nim: true, avatar: true } } },
      },
    },
  });

  if (!topic) return c.json({ message: "Topik tidak ditemukan" }, 404);

  return c.json({
    id: topic.id,
    title: topic.title,
    content: topic.content,
    imagePath: topic.imagePath,
    isPinned: topic.isPinned,
    categoryId: topic.category.id,
    categoryName: topic.category.value,
    createdAt: topic.createdAt,
    updatedAt: topic.updatedAt,
    author: {
      id: topic.user.id,
      name: topic.user.name,
      nim: topic.user.nim,
      avatar: topic.user.avatar,
    },
    replies: topic.replies.map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.createdAt,
      author: {
        id: r.user.id,
        name: r.user.name,
        nim: r.user.nim,
        avatar: r.user.avatar,
      },
    })),
  });
});

// ---------- Buat topik baru ----------
forum.post("/forum/topics", zValidator("json", createTopicSchema), async (c) => {
  const userId = c.get("userId");
  const body = c.req.valid("json");

  const category = await prisma.enumeration.findFirst({
    where: { id: body.categoryId, key: "forum_category", deletedAt: null },
  });
  if (!category) return c.json({ message: "Kategori tidak valid" }, 400);

  const topic = await prisma.forumTopic.create({
    data: {
      categoryId: body.categoryId,
      userId,
      title: body.title.trim(),
      content: body.content.trim(),
    },
    include: {
      user: { select: { id: true, name: true, nim: true } },
      category: { select: { id: true, value: true } },
    },
  });

  return c.json(
    {
      id: topic.id,
      title: topic.title,
      content: topic.content,
      categoryId: topic.category.id,
      categoryName: topic.category.value,
      createdAt: topic.createdAt,
      author: { id: topic.user.id, name: topic.user.name, nim: topic.user.nim },
    },
    201
  );
});

// ---------- Balas topik ----------
forum.post("/forum/topics/:id/replies", zValidator("json", createReplySchema), async (c) => {
  const topicId = c.req.param("id");
  const userId = c.get("userId");
  const body = c.req.valid("json");

  const topic = await prisma.forumTopic.findFirst({
    where: { id: topicId, deletedAt: null },
  });
  if (!topic) return c.json({ message: "Topik tidak ditemukan" }, 404);

  const reply = await prisma.forumReply.create({
    data: {
      forumTopicId: topicId,
      userId,
      content: body.content.trim(),
    },
    include: {
      user: { select: { id: true, name: true, nim: true, avatar: true } },
    },
  });

  return c.json(
    {
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt,
      author: {
        id: reply.user.id,
        name: reply.user.name,
        nim: reply.user.nim,
        avatar: reply.user.avatar,
      },
    },
    201
  );
});

export { forum };
