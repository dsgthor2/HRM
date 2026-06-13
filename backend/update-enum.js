import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN'`);
    console.log("Enum updated successfully.");
  } catch (e) {
    console.error("Error updating enum:", e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
