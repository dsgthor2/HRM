import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const designations = await prisma.designation.findMany();
  const departments = await prisma.department.findMany();
  console.log('Designations:', designations.map(d => d.title));
  console.log('Departments:', departments.map(d => d.name));
}

main().catch(console.error).finally(() => prisma.$disconnect());
