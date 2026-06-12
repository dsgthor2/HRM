const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function ensureAdmins() {
  const admins = [
    { name: 'Harish M', email: 'harish.m@defenseblu.com', password: 'Password@123' },
    { name: 'Lokesh V', email: 'hr@defenseblu.com', password: 'Password@123' },
    { name: 'Admin', email: 'admin@defenseblu.com', password: 'DefenseBlu@2026' },
  ];
  for (const a of admins) {
    const hashed = await bcrypt.hash(a.password, 10);
    const existing = await prisma.user.findUnique({ where: { email: a.email } });
    if (existing) {
      await prisma.user.update({ where: { email: a.email }, data: { role: 'ADMIN', name: a.name } });
      console.log('Updated to ADMIN:', a.email);
    } else {
      await prisma.user.create({ data: { name: a.name, email: a.email, password: hashed, role: 'ADMIN' } });
      console.log('Created ADMIN:', a.email);
    }
  }
  await prisma.$disconnect();
  console.log('Done!');
}

ensureAdmins().catch(e => { console.error(e); process.exit(1); });
