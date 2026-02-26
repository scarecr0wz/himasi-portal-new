/**
 * Reset password user by NIM (cocok dengan atau tanpa leading zero).
 * Usage: npx tsx scripts/reset-password.ts <NIM> <password-baru>
 * Example: npx tsx scripts/reset-password.ts 058006966 passwordbaru
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [nimArg, newPassword] = process.argv.slice(2);
  if (!nimArg || !newPassword) {
    console.error("Usage: npx tsx scripts/reset-password.ts <NIM> <password-baru>");
    console.error("Example: npx tsx scripts/reset-password.ts 058006966 passwordbaru");
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error("Password minimal 6 karakter.");
    process.exit(1);
  }

  const nimTrim = String(nimArg).trim();
  const nimNorm = nimTrim.replace(/^0+/, "") || "0";

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ nim: nimTrim }, { nim: nimNorm }],
    },
  });

  if (!user) {
    console.error("User dengan NIM tersebut tidak ditemukan.");
    process.exit(1);
  }

  if (user.deletedAt) {
    console.error("User ini sudah dihapus (deletedAt). Restore dulu atau gunakan user lain.");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  console.log("Password berhasil direset:");
  console.log("  NIM:", user.nim);
  console.log("  Nama:", user.name);
  console.log("  Silakan login dengan password baru.");
}

main()
  .catch((e) => {
    console.error(e.message || e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
