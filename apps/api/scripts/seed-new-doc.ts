import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      email: 'newdoctor@gmail.com',
      password,
      role: 'REFERRAL_DOCTOR',
    }
  });
  console.log('Created new REFERRAL_DOCTOR user: newdoctor@gmail.com');
}

main().catch(console.error).finally(() => prisma.$disconnect());
