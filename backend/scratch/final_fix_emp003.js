import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function fix() {
  const joinDate = new Date('2025-01-01');
  await prisma.employee.update({
    where: { employeeId: 'EMP003' },
    data: { joinDate }
  });
  console.log("Join Date updated to 2025-01-01");

  const initialHistory = await prisma.salaryHistory.findFirst({
    where: { employeeId: (await prisma.employee.findFirst({where:{employeeId:'EMP003'}})).id, label: 'Initial CTC' }
  });

  if (initialHistory) {
    await prisma.salaryHistory.update({
      where: { id: initialHistory.id },
      data: { effectiveFrom: joinDate }
    });
    console.log("Initial CTC updated to 2025-01-01");
  }
}

fix().catch(console.error).finally(() => prisma.$disconnect());
