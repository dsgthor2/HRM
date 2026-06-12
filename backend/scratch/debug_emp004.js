import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function debug() {
  const empId = "EMP004"; 
  const employee = await prisma.employee.findFirst({
    where: { OR: [{ id: empId }, { employeeId: empId }] },
    include: {
      salaryHistory: { orderBy: { effectiveFrom: "asc" } },
      letters: { where: { type: { in: ["OFFER", "INCREMENT"] } } }
    }
  });

  if (!employee) {
    console.log("Employee not found");
    return;
  }

  console.log("=== EMPLOYEE INFO ===");
  console.log("Name:", employee.name);
  console.log("Join Date:", employee.joinDate);
  console.log("Current Salary:", employee.salary);

  console.log("\n=== SALARY HISTORY ===");
  employee.salaryHistory.forEach(h => {
    console.log(`${h.label}: ₹${h.salary} (Effective: ${h.effectiveFrom.toISOString().split('T')[0]})`);
  });

  console.log("\n=== LETTERS ===");
  employee.letters.forEach(l => {
    console.log(`${l.type} (Created: ${l.createdAt.toISOString().split('T')[0]})`);
    console.log(`   Metadata:`, JSON.stringify(l.metadata));
  });
}

debug().catch(console.error).finally(() => prisma.$disconnect());
