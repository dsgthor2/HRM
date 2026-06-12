import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkAllLetters() {
  const emp = await prisma.employee.findFirst({ where: { employeeId: 'EMP004' } });
  
  const letters = await prisma.letter.findMany({
    where: { employeeId: emp.id, type: { in: ["OFFER", "INCREMENT"] } },
    orderBy: { createdAt: "asc" }
  });
  
  console.log(`Found ${letters.length} letters for EMP004`);
  for (const letter of letters) {
    const m = letter.metadata || {};
    let effDate = (letter.type === "OFFER" && emp.joinDate) ? new Date(emp.joinDate) : (m.effectiveDate ? new Date(m.effectiveDate) : new Date(letter.createdAt));
    if (letter.type === "INCREMENT" && !m.effectiveDate) {
      effDate = new Date(effDate);
      effDate.setDate(1);
    }
    console.log(`- Type: ${letter.type}, Created: ${letter.createdAt.toISOString()}`);
    console.log(`  Calculated effDate: ${effDate.toISOString()}`);
    console.log(`  m.effectiveDate: ${m.effectiveDate}`);
  }
}

checkAllLetters().catch(console.error).finally(() => prisma.$disconnect());
