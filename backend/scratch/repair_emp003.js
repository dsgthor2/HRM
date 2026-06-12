import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function repair() {
  const empId = "EMP003"; 
  const employee = await prisma.employee.findFirst({
    where: { OR: [{ id: empId }, { employeeId: empId }] },
    include: { letters: true }
  });

  if (!employee) return console.log("Employee not found");

  console.log(`Repairing ${employee.name}...`);
  
  // Re-run the sync logic manually for this employee
  const relevantLetters = await prisma.letter.findMany({
    where: { employeeId: employee.id, type: { in: ["OFFER", "INCREMENT"] } }
  });

  for (const letter of relevantLetters) {
    const m = letter.metadata || {};
    let effDate = m.effectiveDate ? new Date(m.effectiveDate) : new Date(letter.createdAt);
    if (letter.type === "OFFER" && employee.joinDate) effDate = new Date(employee.joinDate);
    
    // Find ANY existing record from this letter
    const existing = await prisma.salaryHistory.findFirst({
       where: { employeeId: employee.id, label: letter.type === "OFFER" ? "Initial CTC" : "Increment" }
    });

    if (existing) {
       console.log(`  Updating ${existing.label} to Join Date: ${effDate.toISOString().split('T')[0]}`);
       await prisma.salaryHistory.update({
         where: { id: existing.id },
         data: { effectiveFrom: effDate }
       });
    }
  }
}

repair().catch(console.error).finally(() => prisma.$disconnect());
