import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "../lib/db.js";
import { signToken, authMiddleware } from "../lib/auth.js";
import type { AuthVariables } from "../lib/auth.js";
import type { User } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.resolve(__dirname, "..", "..", "uploads");
const AVATAR_MAX_SIZE = 3 * 1024 * 1024; // 3MB
const AVATAR_ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const AVATAR_EXT: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/gif": ".gif", "image/webp": ".webp" };

const signInSchema = z.object({
  nim: z.string().min(1),
  password: z.string().min(6),
});

const registerSchema = z.object({
  nim: z.string().min(1, "NIM wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  angkatan: z.string().min(1, "Angkatan wajib diisi").max(10),
  phone_number: z.string().min(1, "Nomor HP wajib diisi").max(20),
  alasan: z.string().min(50, "Alasan bergabung minimal 50 karakter"),
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

function userToResource(u: User & { jabatan?: { value?: string } | null; departemen?: { id?: string; title?: string } | null }) {
  const dep = u.departemen as { id?: string; title?: string } | null | undefined;
  return {
    id: String(u.id),
    name: String(u.name),
    nim: String(u.nim),
    email: String(u.email),
    jabatan_id: u.jabatanId ?? null,
    avatar: u.avatar ?? null,
    jabatan: (u.jabatan && "value" in u.jabatan ? (u.jabatan as { value?: string }).value : null) ?? null,
    departemen: dep && dep.id ? { id: String(dep.id), title: String(dep.title ?? "") } : null,
    angkatan: u.angkatan ?? null,
    joined_at: u.joinedAt != null ? (u.joinedAt instanceof Date ? u.joinedAt.toISOString() : u.joinedAt) : null,
    birth_date: u.birthDate != null ? (u.birthDate instanceof Date ? u.birthDate.toISOString() : u.birthDate) : null,
    phone_number: u.phoneNumber ?? null,
    instagram_account: u.instagramAccount ?? null,
    address: u.address ?? null,
  };
}

export const auth = new Hono<{ Variables: AuthVariables }>();

auth.post("/sign-in", zValidator("json", signInSchema), async (c) => {
  try {
    const nimTrim = String(c.req.valid("json").nim).trim();
    const password = String(c.req.valid("json").password);
    const nimNorm = nimTrim.replace(/^0+/, "") || "0";

    const user = await prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [{ nim: nimTrim }, { nim: nimNorm }],
      },
      include: { jabatan: true, departemen: true },
    });

    if (!user) {
      console.error("Sign-in: user not found for NIM (trim=%s, norm=%s)", nimTrim, nimNorm);
      return c.json({ message: "NIM atau password salah." }, 401);
    }

    let ok = false;
    try {
      ok = await bcrypt.compare(password, user.password);
    } catch (e) {
      console.error("Sign-in: bcrypt compare error", e);
      return c.json({ message: "NIM atau password salah." }, 401);
    }

    if (!ok) {
      return c.json({ message: "NIM atau password salah." }, 401);
    }

    const token = await signToken({ sub: String(user.id), nim: user.nim });
    const resource = userToResource(user);
    return c.json({
      message: "Sign in successful",
      access_token: token,
      token_type: "Bearer",
      user: resource,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Sign-in error:", msg);
    return c.json({ message: "Gagal memproses login. Coba lagi." }, 500);
  }
});

auth.post("/register", zValidator("json", registerSchema), async (c) => {
  try {
    const { nim, name, email, password, angkatan, phone_number, alasan } = c.req.valid("json");
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
        angkatan: String(angkatan).trim().slice(0, 10),
        phoneNumber: String(phone_number).trim().slice(0, 20),
        registrationReason: String(alasan).trim(),
        membershipStatus: "PENDING",
      },
    });
    return c.json({ message: "Pendaftaran berhasil. Menunggu verifikasi admin. Anda akan dihubungi setelah disetujui." }, 201);
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

auth.post("/update-avatar", authMiddleware, async (c) => {
  const userId = c.get("userId") as string;
  const form = await c.req.formData();
  const file = form.get("avatar");
  if (!file || !(file instanceof File)) {
    return c.json({ message: "Pilih file gambar (field avatar)." }, 400);
  }
  const mime = (file.type ?? "").toLowerCase();
  if (!AVATAR_ALLOWED.includes(mime)) {
    return c.json({ message: "Tipe file tidak diizinkan. Gunakan JPEG, PNG, GIF, atau WebP." }, 400);
  }
  if (file.size > AVATAR_MAX_SIZE) {
    return c.json({ message: "Ukuran file maksimal 3MB." }, 400);
  }
  await mkdir(UPLOADS_DIR, { recursive: true });
  const ext = AVATAR_EXT[mime] ?? ".jpg";
  const filename = `avatar-${userId}${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);
  await prisma.user.update({
    where: { id: userId },
    data: { avatar: filename },
  });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { jabatan: true, departemen: true },
  });
  return c.json({
    message: "Foto profil berhasil diperbarui",
    user: user ? userToResource(user) : null,
  });
});
