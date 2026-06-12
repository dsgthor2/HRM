import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// List of designations to DELETE (wrong/duplicate entries)
// Add any other duplicates you want removed here
const toDelete = [
  "Associate Engineers",  // duplicate of "Associate Engineer"
];

async function main() {
  console.log("🧹 Cleaning up duplicate designations...\n");

  for (const title of toDelete) {
    const found = await prisma.designation.findUnique({ where: { title } });
    if (!found) {
      console.log(`⚠️  "${title}" not found - skipping`);
      continue;
    }

    // Check if any employee uses this designation
    const empCount = await prisma.employee.count({ where: { designation: title } });
    if (empCount > 0) {
      console.log(`⛔  "${title}" is used by ${empCount} employee(s) - skipping to be safe`);
      continue;
    }

    await prisma.designation.delete({ where: { title } });
    console.log(`✅  Deleted: "${title}"`);
  }

  // Show remaining designations
  const all = await prisma.designation.findMany({ orderBy: { title: "asc" } });
  console.log(`\n📋 Remaining designations (${all.length}):`);
  all.forEach((d, i) => console.log(`  ${i + 1}. ${d.title}`));

  console.log("\n✅ Cleanup complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
