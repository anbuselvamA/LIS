import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:3001';
const prisma = new PrismaClient();

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}: ${JSON.stringify(data)}`);
  }
  return { data };
}

async function setup() {
  try {
    console.log('Setting up Multi-Tab Test Data...');

    // 1. Admin Login
    const authRes = await request('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin1@test.com', password: 'password123' })
    });
    const adminHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authRes.data.accessToken}` };

    // 2. Ensure Users exist
    await request('/users', { method: 'POST', headers: adminHeaders, body: JSON.stringify({ email: 'lab_tech@test.com', password: 'password123', role: 'LAB_TECHNICIAN' }) }).catch(() => {});
    await request('/users', { method: 'POST', headers: adminHeaders, body: JSON.stringify({ email: 'doctor_demo@test.com', password: 'password123', role: 'DOCTOR' }) }).catch(() => {});
    await request('/users', { method: 'POST', headers: adminHeaders, body: JSON.stringify({ email: 'receptionist_demo2@test.com', password: 'password123', role: 'RECEPTIONIST' }) }).catch(() => {});

    // 3. Receptionist Login
    const recAuth = await request('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'receptionist_demo2@test.com', password: 'password123' })
    });
    const recHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${recAuth.data.accessToken}` };

    // 4. Register Patient
    const patRes = await request('/patients', {
      method: 'POST',
      headers: recHeaders,
      body: JSON.stringify({ firstName: 'MultiTab', lastName: 'Patient', phone: '9998887776', gender: 'FEMALE', dateOfBirth: '1990-01-01' })
    });
    const patientId = patRes.data.id;

    // 5. Fetch Tests
    const tests = await request('/tests', { headers: recHeaders });
    const testIds = tests.data.slice(0, 1).map((t: any) => ({ testId: t.id }));

    // 6. Create Order
    const orderRes = await request('/orders', {
      method: 'POST',
      headers: recHeaders,
      body: JSON.stringify({ patientId, items: testIds })
    });
    const orderId = orderRes.data.id;
    
    // 7. Lab Login
    const labAuth = await request('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'lab_tech@test.com', password: 'password123' })
    });
    const labHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${labAuth.data.accessToken}` };

    // Wait for samples
    await new Promise(r => setTimeout(r, 2000));

    // 8. Get order details to get sample ID
    const orderDetails = await request(`/orders/${orderId}`, { headers: labHeaders });
    const sample = orderDetails.data.samples[0];
    
    if (sample) {
      // 9. Process Sample
      await request(`/samples/${sample.id}`, { method: 'PUT', headers: labHeaders, body: JSON.stringify({ status: 'COLLECTED' }) });
      await request(`/samples/${sample.id}`, { method: 'PUT', headers: labHeaders, body: JSON.stringify({ status: 'RECEIVED' }) });
      await request(`/samples/${sample.id}`, { method: 'PUT', headers: labHeaders, body: JSON.stringify({ status: 'PROCESSING' }) });
    }

    console.log(`Setup complete. Order ID: ${orderId}`);
  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}
setup();
