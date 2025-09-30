import argon2 from 'argon2';
import { addDays, subDays, subYears } from 'date-fns';

import { prisma } from '../src/prisma';

async function main() {
  const passwordHash = await argon2.hash('Password123!');

  const org = await prisma.org.upsert({
    where: { id: 'acme-org' },
    update: { name: 'Acme Roofing' },
    create: {
      id: 'acme-org',
      name: 'Acme Roofing'
    }
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@acme.test' },
    update: {
      password: passwordHash,
      name: 'Acme Owner',
      locale: 'en'
    },
    create: {
      id: 'acme-owner-user',
      email: 'owner@acme.test',
      password: passwordHash,
      name: 'Acme Owner',
      locale: 'en'
    }
  });

  await prisma.orgUser.upsert({
    where: {
      orgId_userId: {
        orgId: org.id,
        userId: owner.id
      }
    },
    update: {
      role: 'OWNER'
    },
    create: {
      id: 'acme-org-owner',
      orgId: org.id,
      userId: owner.id,
      role: 'OWNER'
    }
  });

  const janeHireDate = subYears(new Date(), 1);
  const johnHireDate = subYears(new Date(), 2);

  const jane = await prisma.employee.upsert({
    where: { id: 'acme-employee-jane' },
    update: {
      firstName: 'Jane',
      lastName: 'Doe',
      jobTitle: 'Roofer',
      hireDate: janeHireDate
    },
    create: {
      id: 'acme-employee-jane',
      orgId: org.id,
      firstName: 'Jane',
      lastName: 'Doe',
      jobTitle: 'Roofer',
      hireDate: janeHireDate
    }
  });

  await prisma.employee.upsert({
    where: { id: 'acme-employee-john' },
    update: {
      firstName: 'John',
      lastName: 'Smith',
      jobTitle: 'Foreman',
      hireDate: johnHireDate
    },
    create: {
      id: 'acme-employee-john',
      orgId: org.id,
      firstName: 'John',
      lastName: 'Smith',
      jobTitle: 'Foreman',
      hireDate: johnHireDate
    }
  });

  const forkliftTemplate = await prisma.certificationTemplate.upsert({
    where: { id: 'acme-cert-template-forklift' },
    update: {
      name: 'Forklift Operator',
      validDays: 1095
    },
    create: {
      id: 'acme-cert-template-forklift',
      orgId: org.id,
      name: 'Forklift Operator',
      validDays: 1095
    }
  });

  await prisma.certificationTemplate.upsert({
    where: { id: 'acme-cert-template-fall-protection' },
    update: {
      name: 'Fall Protection',
      validDays: 730
    },
    create: {
      id: 'acme-cert-template-fall-protection',
      orgId: org.id,
      name: 'Fall Protection',
      validDays: 730
    }
  });

  const forkliftIssuedAt = subDays(new Date(), 60);
  const forkliftExpiresAt = addDays(forkliftIssuedAt, forkliftTemplate.validDays);

  await prisma.employeeCertification.upsert({
    where: { id: 'acme-employee-cert-jane-forklift' },
    update: {
      employeeId: jane.id,
      templateId: forkliftTemplate.id,
      issuedAt: forkliftIssuedAt,
      expiresAt: forkliftExpiresAt
    },
    create: {
      id: 'acme-employee-cert-jane-forklift',
      employeeId: jane.id,
      templateId: forkliftTemplate.id,
      issuedAt: forkliftIssuedAt,
      expiresAt: forkliftExpiresAt
    }
  });

  const incidentOccurredAt = subDays(new Date(), 7);

  await prisma.incident.upsert({
    where: { id: 'acme-incident-jane-first-aid' },
    update: {
      employeeId: jane.id,
      orgId: org.id,
      occurredAt: incidentOccurredAt,
      location: 'Atlanta job site',
      description: 'Minor cut while handling shingles',
      treatment: 'First aid',
      lostDays: 0,
      restrictedDays: 0
    },
    create: {
      id: 'acme-incident-jane-first-aid',
      orgId: org.id,
      employeeId: jane.id,
      occurredAt: incidentOccurredAt,
      location: 'Atlanta job site',
      description: 'Minor cut while handling shingles',
      treatment: 'First aid',
      lostDays: 0,
      restrictedDays: 0
    }
  });

  console.log('Seeded login: owner@acme.test / Password123!');
}

main()
  .catch((error) => {
    console.error('Seeding failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
