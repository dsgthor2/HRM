import { PrismaClient } from "@prisma/client";
import { generatePayslipPDF } from "../src/utils/pdfGenerator.js";

const prisma = new PrismaClient();

async function nuclearFix() {
  console.log("🚀 NUCLEAR FIX STARTING...");

  // 1. PURGE ALL HISTORY
  await prisma.salaryHistory.deleteMany();
  console.log("✅ Database Purged (SalaryHistory empty).");

  // 2. REBUILD ALL HISTORY FROM LETTERS
  const employees = await prisma.employee.findMany({
    include: { letters: { where: { type: { in: ["OFFER", "INTERNSHIP", "CONTRACT", "INCREMENT"] } } } }
  });

  const parseSal = (val) => {
    if (!val) return 0;
    if (typeof val === 'string') return parseFloat(val.replace(/,/g, '')) || 0;
    return parseFloat(val) || 0;
  };

  for (const employee of employees) {
    console.log(`- Rebuilding ${employee.name}...`);
    const relevantLetters = employee.letters.sort((a, b) => a.createdAt - b.createdAt);

    for (const letter of relevantLetters) {
      const m = letter.metadata || {};
      const sal = parseSal(m.monthlyGross || m.grossMonthly) || 
                 (parseSal(m.annualCTC || m.ctc) > 0 ? (["INTERNSHIP", "CONTRACT"].includes(letter.type) ? parseSal(m.annualCTC || m.ctc) : Math.round(parseSal(m.annualCTC || m.ctc) / 12)) : 0);
      
      if (sal > 0) {
        const isInitial = ["OFFER", "INTERNSHIP", "CONTRACT"].includes(letter.type);
        let effDate = (isInitial && employee.joinDate) ? new Date(employee.joinDate) : (m.effectiveDate ? new Date(m.effectiveDate) : new Date(letter.createdAt));
        if (letter.type === "INCREMENT" && !m.effectiveDate) {
          effDate = new Date(effDate);
          effDate.setDate(1);
        }

        let label = isInitial ? "Initial CTC" : `Increment - ${new Date(effDate).toLocaleString('default', { month: 'short', year: 'numeric' })}`;
        if (letter.type === "INTERNSHIP") label = "Stipend (Internship)";
        if (letter.type === "CONTRACT") label = "Contract Pay";

        await prisma.salaryHistory.create({
          data: {
            employeeId: employee.id,
            salary: sal,
            label: label,
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

  // 3. REFRESH ALL PAYSLIPS
  console.log("🚀 REFRESHING PAYSLIPS...");
  const payslips = await prisma.payslip.findMany({ include: { employee: true } });

  const getActiveSalary = async (employeeId, month, year) => {
    const monthIdx = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(month);
    const targetDate = new Date(year, monthIdx + 1, 0);
    const history = await prisma.salaryHistory.findMany({
      where: { employeeId, effectiveFrom: { lte: targetDate } },
      orderBy: { effectiveFrom: "desc" },
      take: 1
    });
    return history.length > 0 ? history[0] : null;
  };

  for (const slip of payslips) {
    const snapshot = await getActiveSalary(slip.employeeId, slip.month, slip.year);
    if (!snapshot) continue;

    const monthlyGross = snapshot.salary;
    const basic = monthlyGross * ((snapshot.basicPct || 50) / 100);
    const hra = basic * ((snapshot.hraPct || 40) / 100);
    const special = monthlyGross - basic - hra;
    const totalDeduct = (snapshot.epfEmployee || 0) + (snapshot.esiEmployee || 0) + (snapshot.professionalTax || 0);

    const updated = await prisma.payslip.update({
      where: { id: slip.id },
      data: {
        basic: basic,
        hra: hra,
        specialAllow: special,
        grossSalary: monthlyGross,
        epf: snapshot.epfEmployee || 0,
        esi: snapshot.esiEmployee || 0,
        professionalTax: snapshot.professionalTax || 0,
        totalDeduct: totalDeduct,
        netSalary: monthlyGross - totalDeduct,
        basicPct: snapshot.basicPct || 50,
        hraPct: snapshot.hraPct || 40,
        pdfUrl: null
      }
    });

    try {
      const pdfUrl = await generatePayslipPDF(updated, slip.employee, "standard");
      await prisma.payslip.update({ where: { id: updated.id }, data: { pdfUrl } });
      console.log(`    ✅ ${slip.employee.name} (${slip.month}): Updated to ₹${monthlyGross}`);
    } catch (e) {}
  }

  console.log("🏆 NUCLEAR FIX COMPLETE!");
}

nuclearFix().catch(console.error).finally(() => prisma.$disconnect());
