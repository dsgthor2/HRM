const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const locs = await prisma.location.findMany();
  console.log('LOCATIONS:', JSON.stringify(locs, null, 2));
  const pts = await prisma.professionalTax.findMany();
  console.log('PT RULES:', JSON.stringify(pts, null, 2));
  const emp = await prisma.employee.findFirst({ where: { employeeId: 'EMP001' } });
  console.log('EMPLOYEE:', JSON.stringify(emp, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
