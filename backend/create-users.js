import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const usersToCreate = [
    {
      email: "gupthaa@defenseblu.com",
      name: "Gupthaa",
      password: "Password@123",
      role: "ADMIN"
    },
    {
      email: "hr@defenseblu.com",
      name: "Lokesh V",
      password: "Password@123",
      role: "ADMIN"
    }
  ];

  for (const user of usersToCreate) {
    const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          password: hashedPassword,
          role: user.role
        }
      });
      console.log(`Created user: ${user.email}`);
    } else {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.update({
        where: { email: user.email },
        data: { password: hashedPassword, role: user.role }
      });
      console.log(`Updated user: ${user.email}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
