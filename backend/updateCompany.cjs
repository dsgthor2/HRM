const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const companies = await prisma.company.findMany();
  console.log("Current Companies:", companies);
  
  if (companies.length > 0) {
    const updated = await prisma.company.update({
      where: { id: companies[0].id },
      data: { name: "DefenseBlu" }
    });
    console.log("Updated Company:", updated);
  } else {
    console.log("No companies found.");
  }
  
  await prisma.$disconnect();
}

run();
