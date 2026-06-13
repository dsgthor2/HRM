import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    const employees = await prisma.employee.findMany({
      select: { id: true, email: true, name: true, currentStatus: true }
    });
    const attendance = await prisma.attendance.findMany({
      orderBy: { date: 'desc' },
      take: 5
    });
    console.log('--- USERS ---');
    console.log(users);
    console.log('--- EMPLOYEES ---');
    console.log(employees);
    console.log('--- ATTENDANCE ---');
    console.log(attendance);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
