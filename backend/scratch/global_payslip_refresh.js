import { PrismaClient } from "@prisma/client";
import { generatePayslipPDF } from "../src/utils/pdfGenerator.js";

const prisma = new PrismaClient();

async function globalPayslipRefresh() {
  console.log("Starting Global Payslip Refresh...");

  const payslips = await prisma.payslip.findMany({
    include: { employee: true }
  });

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
    console.log(`- Refreshing ${slip.employee.name} (${slip.month} ${slip.year})...`);
    
    const snapshot = await getActiveSalary(slip.employeeId, slip.month, slip.year);
    if (!snapshot) {
       console.log(`    No history found for this period. Skipping.`);
       continue;
    }

    const monthlyGross = snapshot.salary;
    
    // Quick recalculation logic
    const basicPct = snapshot.basicPct || 50;
    const hraPct = snapshot.hraPct || 40;
    const basic = monthlyGross * (basicPct / 100);
    const hra = basic * (hraPct / 100);
    const special = monthlyGross - basic - hra;
    
    const epf = snapshot.epfEmployee || 0;
    const esi = snapshot.esiEmployee || 0;
    const pt = snapshot.professionalTax || 0;
    const totalDeduct = epf + esi + pt;
    const netSalary = monthlyGross - totalDeduct;

    const updated = await prisma.payslip.update({
      where: { id: slip.id },
      data: {
        basic: basic,
        hra: hra,
        specialAllow: special,
        grossSalary: monthlyGross,
        epf: epf,
        esi: esi,
        professionalTax: pt,
        totalDeduct: totalDeduct,
        netSalary: netSalary,
        basicPct: basicPct,
        hraPct: hraPct,
        pdfUrl: null
      }
    });

    try {
      const pdfUrl = await generatePayslipPDF(updated, slip.employee, "standard");
      await prisma.payslip.update({ where: { id: updated.id }, data: { pdfUrl } });
      console.log(`    ✅ Updated to ₹${monthlyGross} and generated new PDF.`);
    } catch (e) {
      console.log(`    ⚠️ Could not generate PDF: ${e.message}`);
    }
  }

  console.log("Global Payslip Refresh Complete!");
}

globalPayslipRefresh().catch(console.error).finally(() => prisma.$disconnect());
