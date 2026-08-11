const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  const users = await prisma.user.findMany({ where: { role: 'REFERRAL_DOCTOR' }});
  console.log('Referral Doctor Users:', users.map(u => u.email));

  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }});
  console.log('Admin Users:', admins.map(u => u.email));

  const profiles = await prisma.referralDoctorProfile.findMany({
    include: { hospital: true, user: true }
  });
  console.log('Referral Doctor Profiles:', JSON.stringify(profiles, null, 2));
}

checkDb()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
