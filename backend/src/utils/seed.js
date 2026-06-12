import dotenv from "dotenv";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@fingrow.in" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@fingrow.in",
      password: await bcrypt.hash("Fingrow@2026", 10),
      role: "ADMIN",
    },
  });
  console.log("✅ Admin:", admin.email, "| Password: Fingrow@2026");

  await prisma.user.upsert({
    where: { email: "hr@fingrow.in" },
    update: {},
    create: {
      name: "HR Manager",
      email: "hr@fingrow.in",
      password: await bcrypt.hash("HR@2026", 10),
      role: "HR",
    },
  });
  console.log("✅ HR:", "hr@fingrow.in", "| Password: HR@2026");

  await prisma.company.upsert({
    where: { id: "default-company" },
    update: {},
    create: {
      id: "default-company",
      name: "Fingrow Consulting services\nprivate limited",
      address: "2nd floor, Sri ram nagar, 21-1-45/4, Akkarampalle, Tirupati, Andhra pradesh - 517507",
      email: "hr@fingrow.in",
      phone: "+91 00000 00000",
      logoUrl: "/uploads/logo.png",
    },
  });

  // Departments & Designations are managed manually via the UI.
  // Seed will NOT auto-create them to prevent duplicates.
  console.log("ℹ️  Departments/Designations: skipped (managed via UI).");

  const comps = [
    { name: "Basic", type: "EARNING", calcType: "PERCENT", value: 40, taxable: true },
    { name: "HRA", type: "EARNING", calcType: "PERCENT", value: 20, taxable: false },
    { name: "Transport Allowance", type: "EARNING", calcType: "FIXED", value: 1600, taxable: false },
    { name: "Special Allowance", type: "EARNING", calcType: "PERCENT", value: 10, taxable: true },
    { name: "EPF Employee", type: "DEDUCTION", calcType: "PERCENT", value: 12, taxable: false },
    { name: "ESI Employee", type: "DEDUCTION", calcType: "PERCENT", value: 0.75, taxable: false },
  ];
  for (const c of comps) {
    await prisma.salaryComponent.upsert({ where: { name: c.name }, update: {}, create: c });
  }

  // Skipping sample employees as requested by user
  // (Manual addition from UI is preferred)

  // Skipping sample candidates as requested by user

  // Skipping default letter templates as requested by user
  // (Manual addition from UI is preferred)
  console.log("✅ Custom configuration retained. Default letter templates skipped.");

  console.log("\n🎉 Seeding complete!");
  console.log("─────────────────────────────────");
  console.log("Admin Login: admin@fingrow.in / Fingrow@2026");
  console.log("HR Login:    hr@fingrow.in / HR@2026");
  console.log("─────────────────────────────────\n");
}

main().catch(console.error).finally(() => prisma.$disconnect());