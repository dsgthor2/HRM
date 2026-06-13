import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const admins = [
  { email: "gupthaa@defenseblu.com", name: "Gupthaa" },
  { email: "hr@defenseblu.com", name: "Lokesh Vasu" },
  { email: "admin@defenseblu.com", name: "Admin" },
  { email: "dheelepsai.n@defenseblu.com", name: "Dheelepsai N" },
];

async function main() {
  const password = await bcrypt.hash("defenseblu@2026", 10);
  for (const admin of admins) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: { password: password, role: "ADMIN" },
      create: { 
        email: admin.email, 
        password: password, 
        name: admin.name, 
        role: "ADMIN" 
      },
    });
    console.log(`Updated/Created admin: ${admin.email}`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
