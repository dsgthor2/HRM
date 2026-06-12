import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  const emp = await prisma.employee.findFirst({ where: { employeeId: 'EMP004' } });
  const payslips = await prisma.payslip.findMany({
    where: { employeeId: emp.id, month: 'May', year: 2026 }
  });
  
  console.log("=== MAY PAYSLIPS FOR EMP004 ===");
  payslips.forEach(p => {
    console.log(`ID: ${p.id}, Gross: ${p.grossSalary}, PDF: ${p.pdfUrl}`);
  });
}

check().catch(console.error).finally(() => prisma.$disconnect());
