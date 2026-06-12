import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const letters = await prisma.letter.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const employees = await prisma.employee.findMany();

  for (const emp of employees) {
    // Find the most recent letter for this employee
    const lastLetter = letters.find(l => 
      l.employeeId === emp.id || 
      (l.metadata && (l.metadata.empId === emp.employeeId || l.metadata.email === emp.email))
    );

    if (lastLetter && lastLetter.metadata) {
      const m = lastLetter.metadata;
      const updateData = {};

      if (!emp.dob && m.dob) {
        const dt = new Date(m.dob);
        if (!isNaN(dt.getTime())) updateData.dob = dt;
      }
      if (!emp.gender && m.gender)       updateData.gender = m.gender;
      if (!emp.pan && m.pan)             updateData.pan = m.pan.toUpperCase();
      if (!emp.aadhaar && m.aadhaar)     updateData.aadhaar = m.aadhaar;
      if (!emp.phone && m.mobile)        updateData.phone = m.mobile;
      if (!emp.addressLine1 && m.address1) updateData.addressLine1 = m.address1;
      if (!emp.addressLine2 && m.address2) updateData.addressLine2 = m.address2;
      if (!emp.city && m.city)           updateData.city = m.city;
      if (!emp.state && m.state)         updateData.state = m.state;
      if (!emp.pincode && m.pinCode)     updateData.pincode = m.pinCode;
      if (!emp.country && m.country)     updateData.country = m.country;

      if (Object.keys(updateData).length > 0) {
        console.log(`Updating ${emp.name} (${emp.employeeId})...`);
        await prisma.employee.update({
          where: { id: emp.id },
          data: updateData
        });
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
