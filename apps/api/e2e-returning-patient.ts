import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error: any = new Error('HTTP Error');
    error.response = { status: res.status, data };
    throw error;
  }
  return { data };
}

async function runE2E() {
  try {
    // 1. Get tokens
    const authRes = await request('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin1@test.com',
        password: 'password123'
      })
    });
    const token = authRes.data.accessToken;
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    console.log('=== BEFORE ===');
    const pCountBefore = await prisma.patient.count();
    const oCountBefore = await prisma.testOrder.count();
    const oiCountBefore = await prisma.orderItem.count();
    const sCountBefore = await prisma.sample.count();
    console.log(`Patients: ${pCountBefore}`);
    console.log(`Orders: ${oCountBefore}`);
    console.log(`OrderItems: ${oiCountBefore}`);
    console.log(`Samples: ${sCountBefore}`);

    // Clean up our test phone if it exists
    await prisma.patient.deleteMany({
      where: { phone: '9998887776' }
    });
    
    // Create new patient
    const phone = '9998887776';
    console.log('\\nRegistering new patient...');
    const p1 = await request('/patients', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        firstName: 'E2E',
        lastName: 'ReturningTest',
        phone: phone,
        gender: 'MALE',
        dateOfBirth: '1990-01-01'
      })
    });
    const patientId = p1.data.id;
    console.log(`Patient created: ${p1.data.mrn}`);

    // Try creating duplicate
    console.log('\\nTrying to register duplicate...');
    try {
      await request('/patients', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          firstName: 'E2E-Dupe',
          lastName: 'ReturningTest',
          phone: phone,
          gender: 'MALE',
          dateOfBirth: '1990-01-01'
        })
      });
      console.log('FAIL: Duplicate was created!');
    } catch (e: any) {
      if (e.response?.status === 409) {
        console.log('SUCCESS: Duplicate rejected with 409 Conflict');
      } else {
        console.log(`FAIL: Rejected with wrong status ${e.response?.status}`);
      }
    }

    // Search for existing
    console.log('\\nSearching for existing patient...');
    const searchRes = await request(`/patients/search?q=${phone}`, { headers: authHeaders });
    console.log(`Found: ${searchRes.data[0].mrn}`);

    // Create Order 1
    const tests = await request('/tests', { headers: authHeaders });
    const testIds = tests.data.slice(0, 2).map((t: any) => ({ testId: t.id }));
    
    console.log('\\nCreating Order 1...');
    const o1 = await request('/orders', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        patientId: patientId,
        items: testIds
      })
    });
    console.log(`Order 1 created: ${o1.data.orderNumber}`);

    // Create Order 2 (Simulating Returning Patient)
    console.log('\\nCreating Order 2 for same patient...');
    const o2 = await request('/orders', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        patientId: searchRes.data[0].id,
        items: [testIds[0]]
      })
    });
    console.log(`Order 2 created: ${o2.data.orderNumber}`);

    console.log('\\n=== AFTER ===');
    const pCountAfter = await prisma.patient.count();
    const oCountAfter = await prisma.testOrder.count();
    const oiCountAfter = await prisma.orderItem.count();
    const sCountAfter = await prisma.sample.count();
    console.log(`Patients: ${pCountAfter} (Delta: ${pCountAfter - pCountBefore})`);
    console.log(`Orders: ${oCountAfter} (Delta: ${oCountAfter - oCountBefore})`);
    console.log(`OrderItems: ${oiCountAfter} (Delta: ${oiCountAfter - oiCountBefore})`);
    console.log(`Samples: ${sCountAfter} (Delta: ${sCountAfter - sCountBefore})`);

    // Verify DB linkage
    const dbOrders = await prisma.testOrder.findMany({ where: { patientId } });
    if (dbOrders.length === 2) {
      console.log('\\nSUCCESS: Database confirmed both orders belong to same Patient ID!');
    }

  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}
runE2E();
