import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  const emp = await prisma.employee.findFirst({ where: { employeeId: 'EMP004' } });
  if (!emp) {
    console.log("EMP004 not found");
    return;
  }
  console.log(`Employee: ${emp.name}`);
  const letters = await prisma.letter.findMany({ where: { employeeId: emp.id } });
  console.log(`Letters (${letters.length}):`);
  letters.forEach(l => console.log(`- ${l.type}: ${l.createdAt.toISOString()}`));
  
  const history = await prisma.salaryHistory.findMany({ where: { employeeId: emp.id }, orderBy: { effectiveFrom: 'asc' } });
  console.log(`\nHistory (${history.length}):`);
  history.forEach(h => console.log(`- ${h.label}: ₹${h.salary}`));
}
run().finally(() => prisma.$disconnect());
