import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const emp = await prisma.employee.findFirst({ where: { employeeId: "EMP003" }});
  console.log(emp);
  
  const history = await prisma.salaryHistory.findMany({ where: { employeeId: emp.id }});
  console.log("HISTORY:", history);
}
check();
