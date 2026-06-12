
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.letter.count({
      where: {
        metadata: {
          path: ['refNum'],
          not: null
        }
      }
    });
    console.log('Count of letters with refNum:', count);
  } catch (err) {
    console.error('Filtering by path failed:', err.message);
    
    // Fallback if path filtering fails
    console.log('Trying alternative count...');
    const all = await prisma.letter.findMany({ select: { metadata: true } });
    const withRef = all.filter(l => l.metadata && l.metadata.refNum);
    console.log('Manual count:', withRef.length);
  }
  process.exit(0);
}

main();
