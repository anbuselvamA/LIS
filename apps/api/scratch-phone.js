const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicates() {
  const patients = await prisma.patient.findMany({
    select: { id: true, phone: true }
  });
  
  const phoneMap = new Map();
  const duplicates = [];

  for (const patient of patients) {
    if (!patient.phone) continue;
    const norm = patient.phone.replace(/\s+/g, '').replace(/^\+91/, '');
    
    if (phoneMap.has(norm)) {
      duplicates.push({ id: patient.id, phone: patient.phone, duplicateOf: phoneMap.get(norm).id });
    } else {
      phoneMap.set(norm, patient);
    }
  }

  console.log(`Found ${duplicates.length} duplicate phones.`);
  console.log(JSON.stringify(duplicates, null, 2));
  
  await prisma.$disconnect();
}
checkDuplicates();
