import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function repair() {
  const empId = "EMP004"; 
  const employee = await prisma.employee.findFirst({
    where: { OR: [{ id: empId }, { employeeId: empId }] },
    include: { letters: true }
  });

  if (!employee) return console.log("Employee not found");

  console.log(`Repairing ${employee.name}...`);
  
  // 1. Clear existing history
  await prisma.salaryHistory.deleteMany({ where: { employeeId: employee.id } });

  // 2. Rebuild from letters
  const relevantLetters = await prisma.letter.findMany({
    where: { employeeId: employee.id, type: { in: ["OFFER", "INCREMENT"] } },
    orderBy: { createdAt: "asc" }
  });

  const parseSal = (val) => {
    if (!val) return 0;
    if (typeof val === 'string') return parseFloat(val.replace(/,/g, '')) || 0;
    return parseFloat(val) || 0;
  };

  for (const letter of relevantLetters) {
    const m = letter.metadata || {};
    const sal = parseSal(m.monthlyGross || m.grossMonthly) || 
               (parseSal(m.annualCTC || m.ctc) > 0 ? Math.round(parseSal(m.annualCTC || m.ctc) / 12) : 0);
    
    if (sal > 0) {
      let effDate = (letter.type === "OFFER" && employee.joinDate) ? new Date(employee.joinDate) : (m.effectiveDate ? new Date(m.effectiveDate) : new Date(letter.createdAt));
      if (letter.type === "INCREMENT" && !m.effectiveDate) {
        effDate = new Date(effDate);
        effDate.setDate(1);
      }

      console.log(`  Creating ${letter.type} for ${effDate.toISOString().split('T')[0]} - ₹${sal}`);

      await prisma.salaryHistory.create({
        data: {
          employeeId: employee.id,
          salary: sal,
          label: letter.type === "OFFER" ? "Initial CTC" : `Increment - ${new Date(effDate).toLocaleString('default', { month: 'short', year: 'numeric' })}`,
          effectiveFrom: effDate,
          basicPct: parseFloat(m.basicPct) || employee.basicPct || 50,
          hraPct: parseFloat(m.hraPct) || employee.hraPct || 40,
          epfEmployee: parseFloat(m.epfEmployee) || employee.epfEmployee || 0,
          esiEmployee: parseFloat(m.esiEmployee) || employee.esiEmployee || 0,
          professionalTax: parseFloat(m.ptOverride) || employee.ptOverride || 200
        }
      });
    }
  }
}

repair().catch(console.error).finally(() => prisma.$disconnect());
