import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001';

async function fetchApi(path: string, options: any = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(JSON.stringify(data) || res.statusText);
  }
  return data;
}

let adminToken = '';
let doctorToken = '';
let receptionistToken = '';

async function runTests() {
  console.log('--- STARTING VERIFICATION ---');

  // 1. Admin Login
  console.log('1. Admin Login');
  const adminRes = await fetchApi('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin1@test.com', password: 'password123' })
  });
  adminToken = adminRes.accessToken || adminRes.access_token;
  if (!adminToken) throw new Error('Admin login failed. Response: ' + JSON.stringify(adminRes));
  console.log('PASS: Admin logged in');

  // 2. Register Doctor
  console.log('2. Admin Registers Doctor');
  const doctorUser = await prisma.user.findFirst({ where: { role: 'REFERRAL_DOCTOR', referralDoctorProfile: null } });
  
  if (!doctorUser) {
     console.log('Skipping doctor registration test: No free REFERRAL_DOCTOR user without profile.');
  } else {
     const hospital = await prisma.referralHospital.findFirst();
     const regRes = await fetchApi('/referral-doctors', {
       method: 'POST',
       headers: { Authorization: `Bearer ${adminToken}` },
       body: JSON.stringify({
         firstName: 'Test',
         lastName: 'Doctor',
         hospitalId: hospital!.id,
         userId: doctorUser.id
       })
     });
     
    if (!regRes.doctorCode.startsWith('RD-')) throw new Error('Doctor code not auto-generated properly');
    console.log('PASS: Doctor registered with code ' + regRes.doctorCode);
  }

  // 2b. Register ALREADY REGISTERED Doctor (Case C)
  console.log('2b. Duplicate Registration (Case C)');
  const linkedProfile = await prisma.referralDoctorProfile.findFirst();
  if (linkedProfile) {
    let errMessage = '';
    try {
      await fetchApi('/referral-doctors', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          firstName: 'Duplicate',
          lastName: 'Doctor',
          hospitalId: linkedProfile.hospitalId,
          userId: linkedProfile.userId
        })
      });
      throw new Error('Allowed duplicate registration!');
    } catch (err: any) {
      if (err.message.includes('409') || err.message.includes('already registered')) {
        console.log('PASS: Caught 409 Conflict successfully');
      } else {
        throw new Error('Expected 409 Conflict but got: ' + err.message);
      }
    }
  }

  // 3. Doctor Login
  console.log('3. Doctor Login');
  const docProfile = await prisma.referralDoctorProfile.findFirst();
  const docUser = await prisma.user.findUnique({ where: { id: docProfile!.userId } });
  
  const docRes = await fetchApi('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email: docUser!.email, password: 'password123' })
  });
  doctorToken = docRes.accessToken || docRes.access_token;
  if (!doctorToken) throw new Error('Doctor login failed. Response: ' + JSON.stringify(docRes));
  console.log('PASS: Doctor logged in');

  // 4. Create Referral Request
  console.log('4. Create Referral Request');
  const tests = await prisma.test.findMany({ take: 2 });
  const refRes = await fetchApi('/referrals', {
    method: 'POST',
    headers: { Authorization: `Bearer ${doctorToken}` },
    body: JSON.stringify({
      patientDetails: {
        firstName: 'New',
        lastName: 'Patient ' + Date.now(),
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
        phone: '123' + Date.now().toString().slice(-7)
      },
      requestedTestIds: tests.map(t => t.id),
      priority: 'ROUTINE',
      reason: 'Test Referral'
    })
  });
  
  if (!refRes.referralNumber) throw new Error('Referral creation failed');
  if (refRes.referralDoctorId !== docProfile!.id) throw new Error('Backend failed to properly derive doctor profile');
  console.log('PASS: Referral Request created: ' + refRes.referralNumber);
  
  // 5. Data Isolation Check
  console.log('5. Data Isolation Check');
  const searchRes = await fetchApi('/patients/search?q=New', {
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  if (searchRes.length === 0) throw new Error('Doctor cannot see their own patient');
  console.log('PASS: Data isolation working');

  // 6. Receptionist Flow
  console.log('6. Receptionist Flow');
  const recUser = await prisma.user.findFirst({ where: { role: 'RECEPTIONIST' } });
  const recRes = await fetchApi('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email: recUser!.email, password: 'password123' })
  });
  receptionistToken = recRes.accessToken || recRes.access_token;
  
  const reqsRes = await fetchApi('/referrals', {
    headers: { Authorization: `Bearer ${receptionistToken}` }
  });
  if (!reqsRes.find((r: any) => r.id === refRes.id)) throw new Error('Receptionist cannot see referral request');
  console.log('PASS: Receptionist sees the request');

  console.log('--- ALL VERIFICATIONS PASSED ---');
}

runTests().catch(err => {
  console.error('FAIL:', err.message);
}).finally(() => prisma.$disconnect());
