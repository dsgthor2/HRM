import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function test() {
  try {
    const emp = await prisma.employee.create({
      data: {
        employeeId: "TEST" + Date.now(),
        name: "Test User",
        email: "test" + Date.now() + "@example.com",
        department: "Engineering",
        designation: "Software Engineer",
        joinDate: new Date()
      }
    });
    console.log("Success:", emp.id);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
