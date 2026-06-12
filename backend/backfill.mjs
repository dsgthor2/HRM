import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.employee.findMany();
  console.log(`Found ${employees.length} employees`);
  
  for (const emp of employees) {
    const existing = await prisma.salaryHistory.findFirst({ where: { employeeId: emp.id, label: "Joining" } });
    if (!existing) {
      await prisma.salaryHistory.create({
        data: {
          employeeId: emp.id,
          salary: emp.salary || 0,
          designation: emp.designation || "",
          department: emp.department || "",
          label: "Joining",
          effectiveFrom: emp.joinDate || emp.createdAt,
          remarks: "Initial joining entry (backfilled)"
        }
      });
      console.log(`✓ Backfilled: ${emp.name}`);
    } else {
      console.log(`⏭ Skipped (already has Joining): ${emp.name}`);
    }
  }
  console.log('Done!');
}

main().catch(console.error).finally(() => process.exit(0));
