import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const letters = await prisma.letter.findMany({ where: { employeeId: 'cmochl6bo00048zc9ix4y3obx' } });
  console.log(letters.map(l => ({ id: l.id, type: l.type, metadata: l.metadata })));
}
main().finally(() => prisma.$disconnect());
