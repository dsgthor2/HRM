import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function probe() {
  const emp = await prisma.employee.findFirst({ where: { employeeId: 'EMP004' } });
  
  const month = "May";
  const year = 2026;
  const monthIdx = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(month);
  const targetDate = new Date(year, monthIdx + 1, 0);

  console.log(`Target Date for May: ${targetDate.toISOString()}`);

  const history = await prisma.salaryHistory.findMany({
    where: { 
      employeeId: emp.id,
      effectiveFrom: { lte: targetDate }
    },
    orderBy: { effectiveFrom: "desc" }
  });

  console.log(`Found ${history.length} history records for this period:`);
  history.forEach(h => {
    console.log(`- ${h.label}: ₹${h.salary} (Effective: ${h.effectiveFrom.toISOString()})`);
  });

  if (history.length > 0) {
    console.log(`\nWINNER (picked for May): ${history[0].label} - ₹${history[0].salary}`);
  }
}

probe().catch(console.error).finally(() => prisma.$disconnect());
