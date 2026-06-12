import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDuplicates() {
  console.log("Cleaning up duplicate candidates...");
  
  // Find all candidates
  const allCandidates = await prisma.candidate.findMany({
    orderBy: { createdAt: 'asc' }
  });
  
  const emailMap = new Map();
  const toDelete = [];
  
  for (const c of allCandidates) {
    if (emailMap.has(c.email)) {
      toDelete.push(c.id);
    } else {
      emailMap.set(c.email, c.id);
    }
  }
  
  if (toDelete.length > 0) {
    await prisma.candidate.deleteMany({
      where: {
        id: { in: toDelete }
      }
    });
    console.log(`Deleted ${toDelete.length} duplicate candidates.`);
  } else {
    console.log("No duplicate candidates found.");
  }
  
  console.log("Cleaning up duplicate employees just in case (by email)...");
  const allEmployees = await prisma.employee.findMany({
    orderBy: { createdAt: 'asc' }
  });
  
  const empEmailMap = new Map();
  const empToDelete = [];
  
  for (const e of allEmployees) {
    if (empEmailMap.has(e.email)) {
      empToDelete.push(e.id);
    } else {
      empEmailMap.set(e.email, e.id);
    }
  }
  
  if (empToDelete.length > 0) {
    await prisma.employee.deleteMany({
      where: {
        id: { in: empToDelete }
      }
    });
    console.log(`Deleted ${empToDelete.length} duplicate employees.`);
  } else {
    console.log("No duplicate employees found.");
  }
}

cleanDuplicates()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
