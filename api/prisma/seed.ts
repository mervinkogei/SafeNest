import { PrismaClient } from '@prisma/client';
import { seedAppData } from '../src/bootstrap-db';

const prisma = new PrismaClient();

async function main() {
  await prisma.resource.deleteMany();
  await seedAppData(prisma);
  console.log('SafeNest seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
