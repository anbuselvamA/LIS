const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicates() {
  console.log('--- Checking for Duplicate Identifiers ---');
  
  // 1. MRNs
  const mrns = await prisma.patient.groupBy({
    by: ['mrn'],
    _count: { mrn: true },
    having: { mrn: { _count: { gt: 1 } } }
  });
  console.log('Duplicate MRNs:', JSON.stringify(mrns));

  // 2. Order Numbers
  const orders = await prisma.testOrder.groupBy({
    by: ['orderNumber'],
    _count: { orderNumber: true },
    having: { orderNumber: { _count: { gt: 1 } } }
  });
  console.log('Duplicate Order Numbers:', JSON.stringify(orders));

  // 3. Sample Numbers
  const samples = await prisma.sample.groupBy({
    by: ['sampleNumber'],
    _count: { sampleNumber: true },
    having: { sampleNumber: { _count: { gt: 1 } } }
  });
  console.log('Duplicate Sample Numbers:', JSON.stringify(samples));

  // 4. Barcodes
  const barcodes = await prisma.sample.groupBy({
    by: ['barcode'],
    _count: { barcode: true },
    having: { barcode: { _count: { gt: 1 } } }
  });
  console.log('Duplicate Barcodes:', JSON.stringify(barcodes));

  // 5. Referral Numbers
  const referrals = await prisma.referralRequest.groupBy({
    by: ['referralNumber'],
    _count: { referralNumber: true },
    having: { referralNumber: { _count: { gt: 1 } } }
  });
  console.log('Duplicate Referral Numbers:', JSON.stringify(referrals));

  // 6. Referral Doctor Codes
  const docs = await prisma.referralDoctorProfile.groupBy({
    by: ['doctorCode'],
    _count: { doctorCode: true },
    having: { doctorCode: { _count: { gt: 1 } } }
  });
  console.log('Duplicate Doctor Codes:', JSON.stringify(docs));
  
  console.log('--- Duplicate Check Complete ---');
  process.exit(0);
}

checkDuplicates().catch(e => {
  console.error(e);
  process.exit(1);
});
