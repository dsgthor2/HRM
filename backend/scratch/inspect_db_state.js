import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkPayslip() {
  const emp = await prisma.employee.findFirst({ where: { employeeId: 'EMP004' } });
  if (!emp) {
    console.log("EMP004 not found");
    return;
  }
  
  const payslip = await prisma.payslip.findFirst({
    where: { employeeId: emp.id, month: 'May', year: 2026 }
  });
  
  if (!payslip) {
    console.log("No May 2026 payslip found for EMP004");
  } else {
    console.log("=== MAY 2026 PAYSLIP DB RECORD ===");
    console.log("ID:", payslip.id);
    console.log("Gross Salary:", payslip.grossSalary);
    console.log("Basic:", payslip.basic);
    console.log("HRA:", payslip.hra);
    console.log("PDF URL:", payslip.pdfUrl);
  }
  
  const history = await prisma.salaryHistory.findMany({
    where: { employeeId: emp.id },
    orderBy: { effectiveFrom: 'asc' }
  });
  
  console.log("\n=== CURRENT SALARY HISTORY ===");
  history.forEach(h => console.log(`${h.effectiveFrom.toISOString()} - ${h.label}: ${h.salary}`));
}

checkPayslip().catch(console.error).finally(() => prisma.$disconnect());
