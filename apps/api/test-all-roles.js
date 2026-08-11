// use native fetch

const usersToTest = [
  { email: 'admin1@test.com', password: 'Admin@123' },
  { email: 'receptionist_demo@test.com', password: 'Admin@123' },
  { email: 'lab_tech@test.com', password: 'Admin@123' },
  { email: 'doctor_demo@test.com', password: 'Admin@123' },
  { email: 'referdoctor@gmail.com', password: 'Admin@123' }
];

async function testAll() {
  for (const user of usersToTest) {
    try {
      let res = await fetch('http://localhost:3001/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      console.log(`[${user.email}] Login Status: ${res.status}`);
      if (res.status === 200) {
        let data = await res.json();
        console.log(` -> Role: ${data.user.role}, Token: ${!!data.accessToken}`);
      }
    } catch (e) {
      console.error(`[${user.email}] Failed to connect:`, e.message);
    }
  }
}

testAll();
