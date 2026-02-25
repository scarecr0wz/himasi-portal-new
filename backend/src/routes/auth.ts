import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/db.js";
import { signToken, authMiddleware } from "../lib/auth.js";
import type { AuthVariables } from "../lib/auth.js";
import type { User } from "@prisma/client";

const signInSchema = z.object({
  nim: z.string().min(1),
  password: z.string().min(6),
});

const registerSchema = z.object({
  nim: z.string().min(1, "NIM wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone_number: z.string().max(20).nullable().optional(),
  address: z.string().nullable().optional(),
  instagram_account: z.string().max(255).nullable().optional(),
  birth_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).nullable().optional(),
  password: z.string().min(6).optional(),
  password_confirmation: z.string().optional(),
}).refine((d) => !d.password || d.password === d.password_confirmation, {
  message: "Password confirmation does not match",
  path: ["password_confirmation"],
});

function userToResource(u: User & { jabatan?: { value: string } | null; departemen?: { id: string; title: string } | null }, appUrl?: string) {
  const base = appUrl || process.env.APP_URL || "";
  return {
    id: u.id,
    name: u.name,
    nim: u.nim,
    email: u.email,
    jabatan_id: u.jabatanId,
    avatar: u.avatar ? `${base}/storage/${u.avatar}` : null,
    jabatan: u.jabatan?.value ?? null,
    departemen: u.departemen ? { id: u.departemen.id, title: (u.departemen as { title: string }).title } : null,
    angkatan: u.angkatan,
    joined_at: u.joinedAt,
    birth_date: u.birthDate,
    phone_number: u.phoneNumber,
    instagram_account: u.instagramAccount,
    address: u.address,
  };
}

export const auth = new Hono<{ Variables: AuthVariables }>();

auth.post("/sign-in", zValidator("json", signInSchema), async (c) => {
  try {
    const { nim, password } = c.req.valid("json");
    const user = await prisma.user.findFirst({
      where: { nim: String(nim).trim(), deletedAt: null },
      include: { jabatan: true, departemen: true },
    });
    if (!user) {
      return c.json({ message: "Invalid credentials" }, 401);
    }
    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) {
      return c.json({ message: "Invalid credentials" }, 401);
    }
    const token = await signToken({ sub: String(user.id), nim: user.nim });
    return c.json({
      message: "Sign in successful",
      access_token: token,
      token_type: "Bearer",
      user: userToResource(user),
    });
  } catch (err) {
    console.error("Sign-in error:", err);
    return c.json({ message: "Invalid credentials" }, 401);
  }
});

auth.post("/register", zValidator("json", registerSchema), async (c) => {
  try {
    const { nim, name, email, password } = c.req.valid("json");
    const nimTrim = String(nim).trim();
    const emailTrim = String(email).trim().toLowerCase();

    const existing = await prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [{ nim: nimTrim }, { email: emailTrim }],
      },
    });
    if (existing) {
      if (existing.nim === nimTrim) {
        return c.json({ message: "NIM sudah terdaftar." }, 400);
      }
      return c.json({ message: "Email sudah terdaftar." }, 400);
    }

    const hashed = await bcrypt.hash(String(password), 10);
    await prisma.user.create({
      data: {
        nim: nimTrim,
        name: String(name).trim(),
        email: emailTrim,
        password: hashed,
      },
    });
    return c.json({ message: "Pendaftaran berhasil. Silakan login." }, 201);
  } catch (err) {
    console.error("Register error:", err);
    return c.json({ message: "Gagal mendaftar. Coba lagi." }, 500);
  }
});

auth.post("/sign-out", authMiddleware, async (c) => {
  // Stateless JWT: client discards token. Optional: blacklist token in Redis/DB if needed.
  return c.json({ message: "Sign out successful" });
});

auth.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  const permNames = user.modelHasPermissions?.map((p) => p.permission.name) ?? [];
  const allRoles = user.modelHasRoles?.map((r) => r.role.name) ?? [];

  const menus = await prisma.menu.findMany({
    where: {
      parentId: null,
      OR: [{ permissionName: { in: permNames } }, { permissionName: null }],
    },
    include: {
      children: {
        where: {
          OR: [{ permissionName: { in: permNames } }, { permissionName: null }],
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  return c.json({
    user: userToResource(user),
    roles: allRoles,
    permissions: permNames,
    menus,
  });
});

auth.put("/update-profile", authMiddleware, zValidator("json", updateProfileSchema), async (c) => {
  const userId = c.get("userId") as string;
  const body = c.req.valid("json");
  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update.name = body.name;
  if (body.email !== undefined) update.email = body.email;
  if (body.phone_number !== undefined) update.phoneNumber = body.phone_number;
  if (body.address !== undefined) update.address = body.address;
  if (body.instagram_account !== undefined) update.instagramAccount = body.instagram_account;
  if (body.birth_date !== undefined) update.birthDate = body.birth_date ? new Date(body.birth_date as string) : null;
  if (body.password) {
    const bcrypt = await import("bcryptjs").catch(() => null);
    update.password = bcrypt ? await bcrypt.hash(body.password, 10) : body.password;
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: update as never,
    include: { jabatan: true, departemen: true },
  });
  return c.json({
    message: "Profile updated successfully",
    user: userToResource(updated),
  });
});

// update-avatar: multipart file upload (stub; implement with @hono/zod-validator or multipart)
auth.post("/update-avatar", authMiddleware, async (c) => {
  const userId = c.get("userId") as string;
  const form = await c.req.formData();
  const file = form.get("avatar");
  if (!file || !(file instanceof File)) {
    return c.json({ message: "avatar is required (image)" }, 400);
  }
  // Save to disk or S3; for scaffold we store path only
  const path = `avatars/${userId}-${file.name}`;
  await prisma.user.update({
    where: { id: userId },
    data: { avatar: path },
  });
  const user = await prisma.user.findUnique({
    where: { id: userId as string },
    include: { jabatan: true, departemen: true },
  });
  return c.json({
    message: "Foto profil berhasil diperbarui",
    user: user ? userToResource(user) : null,
  });
});
