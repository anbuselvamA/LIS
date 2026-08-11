import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runConcurrencyTest() {
  console.log('--- STARTING CONCURRENCY IDENTIFIER TEST ---');
  
  // Create a dummy user and doctor profile if none exists for referrals
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) throw new Error('No admin user found');

  const hospital = await prisma.referralHospital.findFirst();
  let hospitalId = hospital?.id;
  if (!hospitalId) {
    const h = await prisma.referralHospital.create({
      data: { name: 'Test Hospital', hospitalCode: 'TH-001' }
    });
    hospitalId = h.id;
  }

  // Create a base patient to test existing patient workflow
  const basePatient = await prisma.patient.create({
    data: {
      mrn: `MRN-BASE-${Date.now()}`,
      firstName: 'Base',
      lastName: 'Patient',
      gender: 'MALE',
      dateOfBirth: new Date(),
    }
  });

  const testRecords = await prisma.test.findMany({ take: 3 });
  if (testRecords.length < 3) throw new Error('Not enough tests in DB');

  // Pre-seed the sequences to test atomic updates without creation race conditions
  await prisma.sequenceCounter.upsert({ where: { id: 'MRN' }, update: { value: 50000 }, create: { id: 'MRN', value: 50000 } });
  const currentYear = new Date().getFullYear();
  await prisma.sequenceCounter.upsert({ where: { id: `ORD_${currentYear}` }, update: { value: 50000 }, create: { id: `ORD_${currentYear}`, value: 50000 } });
  await prisma.sequenceCounter.upsert({ where: { id: `SMP_${currentYear}` }, update: { value: 50000 }, create: { id: `SMP_${currentYear}`, value: 50000 } });
  await prisma.sequenceCounter.upsert({ where: { id: `BC_${currentYear}` }, update: { value: 50000 }, create: { id: `BC_${currentYear}`, value: 50000 } });

  // Fire 10 concurrent requests to create new patients
  console.log('Testing Patient MRN Concurrency (10 concurrent requests)...');
  const patientPromises: any[] = [];
  for (let i = 0; i < 10; i++) {
    // We simulate the service logic
    patientPromises.push(
      prisma.$transaction(async (tx) => {
        const seq = await tx.sequenceCounter.upsert({
          where: { id: 'MRN' },
          update: { value: { increment: 1 } },
          create: { id: 'MRN', value: 10000 },
        });
        console.log(`Transaction ${i} got sequence value: ${seq.value}`);
        return tx.patient.create({
          data: {
            mrn: `MRN-${seq.value}`,
            firstName: `Conc-${i}`,
            lastName: 'Test',
            gender: 'MALE',
            dateOfBirth: new Date()
          }
        });
      })
    );
  }

  const createdPatients = await Promise.all(patientPromises);
  const uniqueMRNs = new Set(createdPatients.map((p: any) => p.mrn));
  console.log(`Generated ${createdPatients.length} patients. Unique MRNs: ${uniqueMRNs.size}`);
  if (uniqueMRNs.size !== 10) throw new Error('Duplicate MRNs detected!');

  // Fire 5 concurrent requests for multi-test orders on the base patient
  console.log('Testing Order/Sample/Barcode Concurrency (5 concurrent multi-test orders)...');
  const orderPromises: any[] = [];
  for (let i = 0; i < 5; i++) {
    orderPromises.push(
      prisma.$transaction(async (tx) => {
        const currentYear = new Date().getFullYear();
        
        const orderSeq = await tx.sequenceCounter.upsert({
          where: { id: `ORD_${currentYear}` },
          update: { value: { increment: 1 } },
          create: { id: `ORD_${currentYear}`, value: 1 },
        });
        const orderNumber = `ORD-${currentYear}-${String(orderSeq.value).padStart(5, '0')}`;

        const order = await tx.testOrder.create({
          data: {
            orderNumber,
            patientId: basePatient.id,
            totalAmount: 300,
            items: {
              create: testRecords.map(t => ({
                testId: t.id,
                testNameSnapshot: t.testName,
                unitPrice: t.price
              }))
            }
          },
          include: { items: true }
        });

        const sampleRecords: any[] = [];
        for (const item of order.items) {
          const nextSeq = await tx.sequenceCounter.upsert({
            where: { id: `SMP_${currentYear}` },
            update: { value: { increment: 1 } },
            create: { id: `SMP_${currentYear}`, value: 1 },
          });
          const seqString = String(nextSeq.value).padStart(5, '0');
          const sampleNumber = `SMP-${currentYear}-${seqString}`;
          
          const barcodeSeq = await tx.sequenceCounter.upsert({
            where: { id: `BC_${currentYear}` },
            update: { value: { increment: 1 } },
            create: { id: `BC_${currentYear}`, value: 1 },
          });
          const barcode = `BC-${currentYear}-${String(barcodeSeq.value).padStart(5, '0')}`;
          
          sampleRecords.push({
            barcode,
            sampleNumber,
            testOrderId: order.id,
            orderItemId: item.id,
            status: 'PENDING'
          });
        }
        await tx.sample.createMany({ data: sampleRecords as any });
        return order;
      })
    );
  }

  const createdOrders = await Promise.all(orderPromises);
  const uniqueOrders = new Set(createdOrders.map((o: any) => o.orderNumber));
  console.log(`Generated ${createdOrders.length} orders. Unique Orders: ${uniqueOrders.size}`);
  if (uniqueOrders.size !== 5) throw new Error('Duplicate Orders detected!');

  const allSamples = await prisma.sample.findMany({
    where: { testOrderId: { in: createdOrders.map((o: any) => o.id) } }
  });
  
  const uniqueSamples = new Set(allSamples.map(s => s.sampleNumber));
  const uniqueBarcodes = new Set(allSamples.map(s => s.barcode));
  
  console.log(`Generated ${allSamples.length} samples. Unique Samples: ${uniqueSamples.size}, Unique Barcodes: ${uniqueBarcodes.size}`);
  if (uniqueSamples.size !== 15 || uniqueBarcodes.size !== 15) { // 5 orders * 3 tests = 15
    throw new Error('Duplicate Samples/Barcodes detected!');
  }

  console.log('--- CONCURRENCY TEST PASSED! ALL IDENTIFIERS ARE UNIQUE AND TRANSACTION-SAFE ---');
  process.exit(0);
}

runConcurrencyTest().catch(e => {
  console.error('Concurrency Test Failed:', e);
  process.exit(1);
});
