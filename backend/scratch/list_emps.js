import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  const emps = await prisma.employee.findMany();
  console.log("Employees:");
  emps.forEach(e => console.log(`${e.employeeId} - ${e.name}`));
}
run().finally(() => prisma.$disconnect());
