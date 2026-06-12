import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  const emp = await prisma.employee.findFirst({ where: { employeeId: 'EMP003' } });
  console.log("Name:", emp?.name);
  console.log("Join Date:", emp?.joinDate);
  console.log("Salary:", emp?.salary);
}

check().catch(console.error).finally(() => prisma.$disconnect());
