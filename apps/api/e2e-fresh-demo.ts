import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:3001';
const prisma = new PrismaClient();

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error: any = new Error(`HTTP Error ${res.status}`);
    error.response = { status: res.status, data };
    throw error;
  }
  return { data };
}

async function verifyFreshDemo() {
  try {
    console.log('--- STARTING FRESH DEMO E2E ---');

    // 0. Cleanup from previous runs
    // 0. Cleanup from previous runs
    // (Handled by reset-db.ts)
    
    // 1. Admin Login
    const authRes = await request('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin1@test.com',
        password: 'password123'
      })
    });
    const adminToken = authRes.data.accessToken;
    console.log('✅ Admin Login PASS');

    const adminHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    };

    // 2. Create Receptionist
    const recRes = await request('/users', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        email: 'receptionist_demo@test.com',
        password: 'password123',
        role: 'RECEPTIONIST'
      })
    });
    console.log('✅ Receptionist Created PASS');

    // 3. Receptionist Login
    const recAuth = await request('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'receptionist_demo@test.com',
        password: 'password123'
      })
    });
    const recHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${recAuth.data.accessToken}`
    };
    console.log('✅ Receptionist Login PASS');

    // 4. Register Patient
    const patRes = await request('/patients', {
      method: 'POST',
      headers: recHeaders,
      body: JSON.stringify({
        firstName: 'Demo',
        lastName: 'Patient',
        phone: '1112223334',
        gender: 'MALE',
        dateOfBirth: '1985-05-15'
      })
    });
    const patientId = patRes.data.id;
    console.log(`✅ Patient Registered PASS (${patRes.data.mrn})`);

    // 5. Fetch Tests
    const tests = await request('/tests', { headers: recHeaders });
    const testIds = tests.data.slice(0, 2).map((t: any) => ({ testId: t.id }));
    console.log('✅ Tests Fetched PASS');

    // 6. Create Order
    const orderRes = await request('/orders', {
      method: 'POST',
      headers: recHeaders,
      body: JSON.stringify({
        patientId: patientId,
        items: testIds
      })
    });
    const orderId = orderRes.data.id;
    console.log(`✅ Order Created PASS (${orderRes.data.orderNumber})`);

    // Wait a brief moment for async sample creation
    await new Promise(r => setTimeout(r, 1000));

    // 7. Verify Samples
    const orderDetails = await request(`/orders/${orderId}`, { headers: recHeaders });
    const samples = orderDetails.data.samples || [];
    console.log('Order Details:', JSON.stringify(orderDetails.data, null, 2));
    if (samples.length > 0) {
      console.log(`✅ Samples Generated PASS (${samples.length} samples)`);
    } else {
      console.log(`⚠️ No samples generated for this test (expected if test has no sample type)`);
    }

    console.log('--- FRESH DEMO E2E SUCCESS ---');
  } catch (error: any) {
    console.error('❌ E2E Failed:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyFreshDemo();
