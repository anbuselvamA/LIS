const API_URL = 'http://localhost:3001';

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function fetchJson(endpoint: string, options: any = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error ${res.status}: ${error}`);
  }
  return res.json();
}

async function runE2E() {
  console.log('--- E2E REFERRAL WORKFLOW TEST ---');
  
  // 1. Admin login to setup preconditions (Tests, Patients, Profiles)
  const adminLogin = await fetchJson('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin1@test.com', password: 'password123' })
  });
  const adminToken = adminLogin.accessToken;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // Fetch a Test
  const tests = await fetchJson('/tests', { headers: adminHeaders });
  const testId = tests[0]?.id;
  assert(testId, 'Test must exist');

  // Fetch a Patient
  const patients = await fetchJson('/patients', { headers: adminHeaders });
  const patientId = patients[0]?.id;
  assert(patientId, 'Patient must exist');

  // Get Referral Doctor user login
  let docToken;
  let doctorProfileId;
  const doctorEmail = `referdoctor_${Date.now()}@gmail.com`;
  try {
    const doctorLogin = await fetchJson('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email: doctorEmail, password: 'password123' })
    });
    docToken = doctorLogin.accessToken;
    doctorProfileId = doctorLogin.user.profileId;
  } catch (err) {
    console.log('Referral doctor not found, creating one...');
    const newDoc = await fetchJson('/users', {
      method: 'POST',
      body: JSON.stringify({
        email: doctorEmail,
        password: 'password123',
        role: 'REFERRAL_DOCTOR'
      }),
      headers: adminHeaders
    });
    // Create hospital first
    const newHospital = await fetchJson('/referral-hospitals', {
      method: 'POST',
      body: JSON.stringify({
        hospitalCode: `HOSP-${Date.now()}`,
        name: 'Demo Clinic',
      }),
      headers: adminHeaders
    });
    // Now create the profile
    const newProfile = await fetchJson('/referral-doctors', {
      method: 'POST',
      body: JSON.stringify({
        userId: newDoc.id,
        firstName: 'John',
        lastName: 'Smith',
        doctorCode: `DOC-${Date.now()}`,
        hospitalId: newHospital.id,
      }),
      headers: adminHeaders
    });
    
    const doctorLogin = await fetchJson('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email: doctorEmail, password: 'password123' })
    });
    docToken = doctorLogin.accessToken;
    doctorProfileId = doctorLogin.user.profileId || newProfile.id;
  }
  const docHeaders = { Authorization: `Bearer ${docToken}` };

  // 2. Referral Doctor creates a Referral Request
  console.log('1. Referral Doctor creating request...');
  const createRequest = await fetchJson('/referrals', {
    method: 'POST',
    body: JSON.stringify({
      referralDoctorId: doctorProfileId,
      patientId: patientId,
      requestedTestIds: [testId],
      priority: 'URGENT',
      reason: 'Pre-op checks',
      notes: 'Please expedite'
    }),
    headers: docHeaders
  });
  
  const referralId = createRequest.id;
  console.log(`Created Referral Request: ${createRequest.referralNumber}`);
  assert(createRequest.status === 'NEW', 'Status should be NEW');

  // 3. Admin creates an Order from the Referral Request
  console.log('2. Admin creating Test Order...');
  const createOrder = await fetchJson('/orders', {
    method: 'POST',
    body: JSON.stringify({
      patientId: patientId,
      items: [{ testId }],
      referralRequestId: referralId
    }),
    headers: adminHeaders
  });
  const orderId = createOrder.id;
  console.log(`Created Order: ${createOrder.orderNumber}`);

  // Verify Referral status updated
  const checkReferral = await fetchJson(`/referrals/${referralId}`, { headers: adminHeaders });
  assert(checkReferral.status === 'ORDER_CREATED', 'Status should be ORDER_CREATED');

  // 4. Tech processes sample and enters result
  const techLogin = await fetchJson('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'lab_tech@test.com', password: 'password123' })
  });
  const techHeaders = { Authorization: `Bearer ${techLogin.accessToken}` };

  const samples = await fetchJson('/samples', { headers: techHeaders });
  const sample = samples.find((s: any) => s.testOrderId === orderId);
  assert(sample, 'Sample must exist');

  console.log(`3. Tech entering result for sample ${sample.sampleNumber}...`);
  const resultData = {
    sampleId: sample.id,
    parameterCode: 'TEST01',
    parameterName: 'Test Param',
    resultValue: '120',
    unit: 'mg/dL',
    referenceRange: '100-150',
    abnormalFlag: 'NORMAL',
  };
  const enterResult = await fetchJson('/results', {
    method: 'POST',
    body: JSON.stringify(resultData),
    headers: techHeaders
  });
  const resultId = enterResult.id;

  // 5. Internal Doctor verifies result
  const internalDocLogin = await fetchJson('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'doctor_demo@test.com', password: 'password123' })
  });
  const internalDocHeaders = { Authorization: `Bearer ${internalDocLogin.accessToken}` };

  console.log(`4. Internal Doctor verifying result...`);
  await fetchJson(`/results/${resultId}/verify`, { method: 'PUT', headers: internalDocHeaders });

  // 6. Check Referral Request Status
  console.log(`5. Checking if Referral Request is RESULT_READY...`);
  const finalCheck = await fetchJson(`/referrals/${referralId}`, { headers: adminHeaders });
  assert(finalCheck.status === 'RESULT_READY', 'Referral status must be RESULT_READY');
  
  // 6. Referral Doctor fetching My Reports...
  console.log('6. Referral Doctor fetching My Reports...');
  const myReports = await fetchJson('/referrals', {
    headers: docHeaders
  });
  if (!myReports || myReports.length === 0) {
    throw new Error('No reports found for Referral Doctor. Expected at least 1.');
  }

  // 7. Verify unauthorized access (Create a second referral doctor and try to access the first doctor's referral)
  console.log('7. Verifying unauthorized report access...');
  const doctorEmail2 = `referdoctor_${Date.now()}@gmail.com`;
  
  // Create second doctor
  const newDoc2 = await fetchJson('/users', {
    method: 'POST',
    body: JSON.stringify({
      email: doctorEmail2,
      password: 'password123',
      role: 'REFERRAL_DOCTOR'
    }),
    headers: adminHeaders
  });
  
  // Create second hospital
  const newHospital2 = await fetchJson('/referral-hospitals', {
    method: 'POST',
    body: JSON.stringify({
      hospitalCode: `HOSP-${Date.now()}`,
      name: 'Unauthorized Clinic',
    }),
    headers: adminHeaders
  });
  
  // Create second profile
  await fetchJson('/referral-doctors', {
    method: 'POST',
    body: JSON.stringify({
      userId: newDoc2.id,
      firstName: 'Evil',
      lastName: 'Doctor',
      doctorCode: `DOC-${Date.now()}`,
      hospitalId: newHospital2.id,
    }),
    headers: adminHeaders
  });

  // Login as second doctor
  const doctorLogin2 = await fetchJson('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email: doctorEmail2, password: 'password123' })
  });
  const docToken2 = doctorLogin2.accessToken;
  const docHeaders2 = { Authorization: `Bearer ${docToken2}` };

  try {
    // Try to access the first doctor's referral request
    await fetchJson(`/referrals/${referralId}`, {
      headers: docHeaders2
    });
    throw new Error('Unauthorized access test failed! Second doctor accessed first doctor\'s referral.');
  } catch (err: any) {
    if (err.message && err.message.includes('403')) {
      console.log('✅ Unauthorized access was correctly blocked with HTTP 403');
    } else {
      throw err;
    }
  }

  console.log('✅ ALL E2E TESTS PASSED SUCCESSFULLY');
}

runE2E().catch(err => {
  console.error('❌ TEST FAILED:', err.message);
  process.exit(1);
});
