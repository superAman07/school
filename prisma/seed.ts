import { PrismaClient, Role, SchoolStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';

// 1. Safely initialize Prisma with the PG Adapter for Supabase
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding the database...');

  // 2. Create YOU (The Super Admin)
  const superAdminPassword = await hash('super66hsh8339iim02', 10);
  await prisma.user.upsert({
    where: { email: 'super@system.com' },
    update: {},
    create: {
      email: 'super@system.com',
      passwordHash: superAdminPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  // 3. Create the first Client (A Demo School)
  const demoSchool = await prisma.school.upsert({
    where: { code: 'DPS-001' },
    update: {},
    create: {
      code: 'DPS-001',
      name: 'Delhi Public School (Demo)',
      status: SchoolStatus.ACTIVE,
      city: 'Delhi',
      settings: {
        create: { admissionOpen: true }
      }
    },
  });

  // 4. Create the School Principal (Admin)
  const principalPassword = await hash('adminjsdij893u4hjis', 10);
  await prisma.user.upsert({
    where: { email: 'principal@dps.com' },
    update: {},
    create: {
      email: 'principal@dps.com',
      passwordHash: principalPassword,
      role: Role.ADMIN,
      schoolId: demoSchool.id,
    },
  });

  console.log('✅ Seeding complete!');
  console.log('-------------------------------------------');
  console.log(`SUPER ADMIN (You) : super@system.com / super123`);
  console.log(`PRINCIPAL (Client): principal@dps.com / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });