async function testLogin() {
  try {
    console.log('Testing Admin Login...');
    let res = await fetch('http://localhost:3001/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@freelancerz.com', password: 'Admin@123' })
    });
    console.log('Admin Status:', res.status);
    let data = await res.json();
    console.log('Admin AccessToken received:', !!data.accessToken);

    console.log('\nTesting Invalid Login...');
    res = await fetch('http://localhost:3001/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@freelancerz.com', password: 'wrong' })
    });
    console.log('Invalid Login Status:', res.status);

    console.log('\nTesting API Health...');
    res = await fetch('http://localhost:3001/health');
    console.log('Health Status:', res.status);
    data = await res.json();
    console.log('Health Data:', data.status);
    
  } catch (e) {
    console.error('Test Failed:', e.message);
  }
}

testLogin();
