import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  const emp = await prisma.employee.findFirst({ where: { employeeId: 'EMP004' } });
  const history = await prisma.salaryHistory.findMany({
    where: { employeeId: emp.id },
    orderBy: { effectiveFrom: 'asc' }
  });
  console.log(JSON.stringify(history, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
