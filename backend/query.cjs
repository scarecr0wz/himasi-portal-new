const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.pengurus.findMany().then(console.log).finally(() => prisma.$disconnect());
