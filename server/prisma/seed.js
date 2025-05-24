const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const trashTypes = [
    { name: 'plastic', points: 10 },
    { name: 'paper', points: 8 },
    { name: 'metal', points: 6 },
    { name: 'glass', points: 4 }
  ];

  for (const type of trashTypes) {
    await prisma.trashType.upsert({
      where: { name: type.name },
      update: { points: type.points },
      create: type
    });
  }

  console.log('Seed data berhasil ditambahkan');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });