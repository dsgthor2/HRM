import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const emps = await prisma.employee.findMany();
  console.log(emps.map(e => ({ name: e.name, id: e.id, salary: e.salary, basicPct: e.basicPct })));
}
main().finally(() => prisma.$disconnect());
