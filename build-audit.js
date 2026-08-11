const { execSync } = require('child_process');
const fs = require('fs');

console.log('--- STARTING BUILD AUDIT ---');

const results = {
  backend: {},
  frontend: {}
};

try {
  console.log('Building API...');
  const apiOut = execSync('npm run build', { cwd: './apps/api', stdio: 'pipe' }).toString();
  results.backend.status = 'PASS';
  results.backend.output = apiOut.substring(0, 500); // Truncate for log
} catch (e) {
  results.backend.status = 'FAIL';
  results.backend.error = e.stdout.toString() + e.stderr.toString();
}

try {
  console.log('Building Frontend...');
  const webOut = execSync('npm run build', { cwd: './apps/frontend', stdio: 'pipe' }).toString();
  results.frontend.status = 'PASS';
  results.frontend.output = webOut.substring(0, 500);
} catch (e) {
  results.frontend.status = 'FAIL';
  results.frontend.error = e.stdout.toString() + e.stderr.toString();
}

fs.writeFileSync('build-audit.json', JSON.stringify(results, null, 2));
console.log('Build audit completed. Results saved to build-audit.json');
