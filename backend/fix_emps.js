import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.employee.update({
    where: { id: "cmochl6bo00048zc9ix4y3obx" }, // EMP003
    data: { salary: 23316, basicPct: 60 }
  });
  await prisma.employee.update({
    where: { id: "cmocikay100038ue4x1etk8g6" }, // EMP004
    data: { salary: 23316, basicPct: 60 }
  });
  console.log("Fixed EMP003 and EMP004 to mathematically perfect Gross.");
}
main().finally(() => prisma.$disconnect());
