import { prisma } from '../src/prisma';

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: 'owner@safetyswift.test' },
    update: {},
    create: {
      email: 'owner@safetyswift.test',
      name: 'Owner',
      role: 'OWNER'
    }
  });

  await prisma.incident.upsert({
    where: { id: 'seed-incident' },
    update: {},
    create: {
      id: 'seed-incident',
      title: 'First Aid Training Incident',
      description: 'Demonstration incident for onboarding the SafetySwift platform.',
      reportedById: owner.id
    }
  });
}

main()
  .catch((error) => {
    console.error('Seeding failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
