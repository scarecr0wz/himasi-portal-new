/**
 * Buat user baru di database himasi-portal.
 * Usage: npx tsx scripts/create-user.ts <NIM> <nama> <email> <password>
 * Example: npx tsx scripts/create-user.ts 234567 "Budi Santoso" budi@example.com mypassword
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [nim, name, email, password] = process.argv.slice(2);
  if (!nim || !name || !email || !password) {
    console.error("Usage: npx tsx scripts/create-user.ts <NIM> <nama> <email> <password>");
    console.error('Example: npx tsx scripts/create-user.ts 234567 "Budi Santoso" budi@example.com mypassword');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("Password minimal 6 karakter.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      nim: nim.trim(),
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
    },
  });

  console.log("User baru berhasil dibuat:");
  console.log("  NIM:", user.nim);
  console.log("  Nama:", user.name);
  console.log("  Email:", user.email);
}

main()
  .catch((e) => {
    if (e.code === "P2002") {
      console.error("Gagal: NIM atau email sudah dipakai.");
    } else {
      console.error(e.message || e);
    }
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
