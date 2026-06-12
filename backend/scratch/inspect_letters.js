import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkLetters() {
  const emp = await prisma.employee.findFirst({ where: { employeeId: 'EMP004' } });
  if (!emp) return;
  
  const letters = await prisma.letter.findMany({
    where: { employeeId: emp.id, type: 'OFFER' }
  });
  
  console.log(`Found ${letters.length} OFFER letters for EMP004`);
  letters.forEach(l => {
    console.log(`- ID: ${l.id}, Created: ${l.createdAt.toISOString()}`);
    console.log(`  Metadata effectiveDate: ${l.metadata.effectiveDate}, joinDate: ${l.metadata.joiningDate}`);
  });
}

checkLetters().catch(console.error).finally(() => prisma.$disconnect());
