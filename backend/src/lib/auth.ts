import * as jose from "jose";
import type { Context, Next } from "hono";
import { prisma } from "./db.js";
import type { User, Enumeration, Departemen, ModelHasRole, ModelHasPermission } from "@prisma/client";

export type AuthUser = User & {
  jabatan: Enumeration | null;
  departemen: Departemen | null;
  modelHasRoles: (ModelHasRole & { role: { name: string } })[];
  modelHasPermissions: (ModelHasPermission & { permission: { name: string } })[];
};

export type AuthVariables = { user: AuthUser; userId: string };

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "change-me-in-production-min-32-chars"
);

export type JwtPayload = {
  sub: string; // user id
  nim: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
};

export async function signToken(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
  return await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(process.env.JWT_ISSUER || "himasi-portal")
    .setAudience(process.env.JWT_AUDIENCE || "himasi-portal")
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export function getBearerToken(c: Context): string | undefined {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) return undefined;
  return auth.slice(7);
}

/** Middleware: require auth, set c.get('user') and c.get('userId') */
export async function authMiddleware(c: Context<{ Variables: AuthVariables }>, next: Next) {
  const token = getBearerToken(c);
  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const payload = await verifyToken(token);
  if (!payload?.sub) {
    return c.json({ message: "Invalid or expired token" }, 401);
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.sub, deletedAt: null },
    include: {
      jabatan: true,
      departemen: true,
      modelHasRoles: { include: { role: true } },
      modelHasPermissions: { include: { permission: true } },
    },
  });
  if (!user) {
    return c.json({ message: "User not found" }, 401);
  }
  c.set("user", user);
  c.set("userId", user.id);
  await next();
}

export function requirePermission(permission: string) {
  return async (c: Context<{ Variables: AuthVariables }>, next: Next) => {
    const user = c.get("user");
    const permNames = user.modelHasPermissions?.map((p) => p.permission.name) ?? [];
    const roleNames = user.modelHasRoles?.map((r) => r.role.name) ?? [];
    // Super admin bypass or exact permission
    if (roleNames.includes("super-admin") || permNames.includes(permission)) {
      await next();
      return;
    }
    return c.json({ message: "Forbidden" }, 403);
  };
}
