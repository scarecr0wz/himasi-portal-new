import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { authMiddleware } from "../lib/auth.js";
import type { AuthVariables } from "../lib/auth.js";

const profileUpdateSchema = z.object({
  // Level 1 - User
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone_number: z.string().max(20).nullable().optional(),
  angkatan: z.string().max(4).nullable().optional(),
  fakultas: z.string().max(100).nullable().optional(),
  program_studi: z.string().max(50).optional(),
  membership_status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  departemen_id: z.string().uuid().nullable().optional(),
  // Level 2 - MahasiswaProfile
  domisili_city: z.string().max(100).nullable().optional(),
  minat_fokus: z.string().max(500).nullable().optional(),
  skills_json: z.string().nullable().optional(),
  portfolio_github: z.string().max(255).nullable().optional(),
  portfolio_linkedin: z.string().max(255).nullable().optional(),
  portfolio_behance: z.string().max(255).nullable().optional(),
  communication_preference: z.enum(["WA", "email"]).nullable().optional(),
  notification_hours: z.string().max(20).nullable().optional(),
  // Consent (Level 3 governance)
  consent: z.boolean().optional(),
});

export const profile = new Hono<{ Variables: AuthVariables }>();

profile.use("*", authMiddleware);

profile.get("/", async (c) => {
  const userId = c.get("userId") as string;
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    include: {
      jabatan: true,
      departemen: true,
      mahasiswaProfile: true,
    },
  });
  if (!user) return c.json({ message: "User not found" }, 404);
  const { password: _p, ...safeUser } = user;
  return c.json({
    user: safeUser,
    mahasiswaProfile: user.mahasiswaProfile ?? null,
  });
});

profile.get("/options", async (c) => {
  const [departemens] = await Promise.all([
    prisma.departemen.findMany({ where: { deletedAt: null }, orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);
  return c.json({
    departemens,
    minatFokusOptions: ["Data", "Web", "Mobile", "UI/UX", "Security", "Cloud", "DevOps", "AI/ML", "Lainnya"],
    fakultasOptions: ["FST", "FE", "FH", "FKIP", "FISIP", "Lainnya"],
    programStudiOptions: ["SI", "IK", "Lainnya"],
    membershipStatusOptions: ["ACTIVE", "INACTIVE"],
  });
});

profile.put("/", zValidator("json", profileUpdateSchema), async (c) => {
  const userId = c.get("userId") as string;
  const authUser = c.get("user");
  const body = c.req.valid("json");

  const roleNames = authUser.modelHasRoles?.map((r) => r.role.name) ?? [];
  const isAdmin = roleNames.includes("admin") || roleNames.includes("superadmin");

  const userUpdate: Record<string, unknown> = {};
  if (body.name !== undefined) userUpdate.name = body.name;
  if (body.email !== undefined) userUpdate.email = body.email;
  if (body.phone_number !== undefined) userUpdate.phoneNumber = body.phone_number;
  if (body.angkatan !== undefined) userUpdate.angkatan = body.angkatan;
  if (body.fakultas !== undefined) userUpdate.fakultas = body.fakultas || null;
  if (body.program_studi !== undefined) userUpdate.programStudi = body.program_studi;
  if (isAdmin) {
    if (body.membership_status !== undefined) userUpdate.membershipStatus = body.membership_status;
    if (body.departemen_id !== undefined) userUpdate.departemenId = body.departemen_id || null;
  }

  await prisma.user.update({
    where: { id: userId },
    data: userUpdate as never,
  });

  const profileUpdate: Record<string, unknown> = {};
  if (body.domisili_city !== undefined) profileUpdate.domisiliCity = body.domisili_city || null;
  if (body.minat_fokus !== undefined) profileUpdate.minatFokus = body.minat_fokus || null;
  if (body.skills_json !== undefined) profileUpdate.skillsJson = body.skills_json || null;
  if (body.portfolio_github !== undefined) profileUpdate.portfolioGithub = body.portfolio_github === "" ? null : body.portfolio_github;
  if (body.portfolio_linkedin !== undefined) profileUpdate.portfolioLinkedin = body.portfolio_linkedin === "" ? null : body.portfolio_linkedin;
  if (body.portfolio_behance !== undefined) profileUpdate.portfolioBehance = body.portfolio_behance === "" ? null : body.portfolio_behance;
  if (body.communication_preference !== undefined) profileUpdate.communicationPreference = body.communication_preference || null;
  if (body.notification_hours !== undefined) profileUpdate.notificationHours = body.notification_hours || null;
  if (body.consent === true) profileUpdate.consentAt = new Date();

  await prisma.mahasiswaProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...(profileUpdate as Record<string, never>),
    },
    update: profileUpdate as never,
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { jabatan: true, departemen: true, mahasiswaProfile: true },
  });
  const { password: _p2, ...safeUser } = user!;
  return c.json({
    message: "Profil berhasil disimpan",
    user: safeUser,
    mahasiswaProfile: user?.mahasiswaProfile ?? null,
  });
});

// ---------- Acara yang user terdaftar (untuk halaman Dashboard > Acara) ----------
profile.get("/activities/registered", async (c) => {
  const userId = c.get("userId") as string;
  const participations = await prisma.mahasiswaEventParticipation.findMany({
    where: { userId, activity: { deletedAt: null } },
    orderBy: { participatedAt: "desc" },
    include: {
      activity: {
        include: { departemen: { select: { id: true, title: true } } },
      },
    },
  });
  const list = participations.map((p) => ({
    ...p.activity,
    participatedAt: p.participatedAt,
    attended: p.attended,
  }));
  return c.json(list);
});

// ---------- Pendaftaran acara (anggota & admin bisa daftar) ----------
profile.get("/activities/:activityId/registered", async (c) => {
  const userId = c.get("userId") as string;
  const activityId = c.req.param("activityId");
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, deletedAt: null },
    select: { id: true },
  });
  if (!activity) return c.json({ message: "Acara tidak ditemukan" }, 404);
  const participation = await prisma.mahasiswaEventParticipation.findUnique({
    where: { userId_activityId: { userId, activityId } },
  });
  return c.json({ registered: !!participation });
});

profile.post("/activities/:activityId/register", async (c) => {
  const userId = c.get("userId") as string;
  const activityId = c.req.param("activityId");
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, deletedAt: null, isActive: true },
    select: { id: true },
  });
  if (!activity) return c.json({ message: "Acara tidak ditemukan atau tidak aktif" }, 404);
  const existing = await prisma.mahasiswaEventParticipation.findUnique({
    where: { userId_activityId: { userId, activityId } },
  });
  if (existing) return c.json({ message: "Anda sudah terdaftar di acara ini" }, 400);
  await prisma.mahasiswaEventParticipation.create({
    data: { userId, activityId },
  });
  return c.json({ message: "Pendaftaran berhasil", registered: true }, 201);
});

profile.delete("/activities/:activityId/register", async (c) => {
  const userId = c.get("userId") as string;
  const activityId = c.req.param("activityId");
  const deleted = await prisma.mahasiswaEventParticipation.deleteMany({
    where: { userId, activityId },
  });
  if (deleted.count === 0) return c.json({ message: "Anda belum terdaftar di acara ini" }, 404);
  return c.json({ message: "Pendaftaran dibatalkan", registered: false });
});
