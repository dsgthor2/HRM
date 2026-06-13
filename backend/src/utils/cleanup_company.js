
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function cleanup() {
  console.log("Checking Company table...");
  const companies = await prisma.company.findMany();
  console.log("Found companies:", JSON.stringify(companies, null, 2));

  if (companies.length > 1) {
    console.log("Multiple companies found. Cleaning up...");
    // Keep only the one we want or just delete all and recreate one
    await prisma.company.deleteMany({});
    await prisma.company.create({
      data: {
        id: "default-company",
        name: "DefenseBlu\nPrivate Limited",
        address: "Global Operations",
        email: "hr@defenseblu.com",
        phone: "+91 00000 00000",
      }
    });
    console.log("Cleanup complete. Only Global Operations address remains.");
  } else if (companies.length === 1) {
    console.log("Updating existing company to Global Operations...");
    await prisma.company.updateMany({
      data: {
        name: "DefenseBlu\nPrivate Limited",
        address: "Global Operations",
      }
    });
  } else {
    console.log("No company found. Creating Global Operations record...");
    await prisma.company.create({
      data: {
        id: "default-company",
        name: "DefenseBlu\nPrivate Limited",
        address: "Global Operations",
        email: "hr@defenseblu.com",
        phone: "+91 00000 00000",
      }
    });
  }
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
