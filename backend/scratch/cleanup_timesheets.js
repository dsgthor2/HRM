import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanDuplicates() {
  const employeeId = "cmo9zwvcb000912gpb5g076tj"; // From user screenshot
  
  // Find all timesheets for this employee
  const timesheets = await prisma.timesheet.findMany({
    where: { employeeId },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Found ${timesheets.length} timesheets for employee ${employeeId}`);

  const seen = new Set();
  const toDelete = [];

  for (const ts of timesheets) {
    const key = `${ts.startDate.toISOString()}_${ts.type}`;
    if (seen.has(key)) {
      toDelete.push(ts.id);
    } else {
      seen.add(key);
    }
  }

  if (toDelete.length > 0) {
    console.log(`Deleting ${toDelete.length} duplicate timesheets...`);
    await prisma.timesheet.deleteMany({
      where: { id: { in: toDelete } }
    });
    console.log("Cleanup complete.");
  } else {
    console.log("No duplicates found.");
  }
}

cleanDuplicates().catch(console.error).finally(() => prisma.$disconnect());
