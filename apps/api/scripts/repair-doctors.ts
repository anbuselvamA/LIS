import { PrismaClient } from '@prisma/client';
import { getNextSequenceValue } from '../src/utils/sequence.util';

const prisma = new PrismaClient();

async function main() {
  // Find all REFERRAL_DOCTOR users without a profile
  const users = await prisma.user.findMany({
    where: { 
      role: 'REFERRAL_DOCTOR',
      referralDoctorProfile: null
    }
  });

  if (users.length === 0) {
    console.log('No REFERRAL_DOCTOR users found without a profile.');
    return;
  }

  // Ensure there is at least one hospital to link them to
  let hospital = await prisma.referralHospital.findFirst();
  if (!hospital) {
    hospital = await prisma.referralHospital.create({
      data: {
        hospitalCode: 'HOSP-DEFAULT',
        name: 'Default Referral Hospital',
      }
    });
  }

  for (const user of users) {
    // Generate a sequence code
    const seq = await getNextSequenceValue(prisma as any, 'REFERRAL_DOCTOR');
    const doctorCode = `RD-${String(seq).padStart(4, '0')}`;

    console.log(`Creating profile for user ${user.email} with code ${doctorCode}`);

    await prisma.referralDoctorProfile.create({
      data: {
        doctorCode,
        firstName: 'Demo',
        lastName: 'Doctor',
        userId: user.id,
        hospitalId: hospital.id,
      }
    });
  }

  console.log(`Successfully repaired ${users.length} referral doctor accounts.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
