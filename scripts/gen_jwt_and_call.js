const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const crypto = require('crypto');
const { execSync } = require('child_process');

function parseDotEnv(content) {
  const lines = content.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf('=');
    if (idx === -1) continue;
    const k = t.substring(0, idx).trim();
    let v = t.substring(idx + 1);
    v = v.replace(/"/g, '').trim();
    env[k] = v;
  }
  return env;
}

(async function main(){
  try {
    const repoRoot = path.resolve(__dirname, '..');
    const envPath = path.join(repoRoot, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = parseDotEnv(envContent);

    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET not found in .env');

    const client = new Client({
      host: env.DB_HOST || 'localhost',
      port: parseInt(env.DB_PORT || '5432'),
      user: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    await client.connect();

    // Try to find an admin/technician user
    let res = await client.query("SELECT id, email, tenant_id, role FROM users WHERE email = 'admin@friocheck.com' LIMIT 1");
    if (res.rows.length === 0) {
      res = await client.query("SELECT id, email, tenant_id, role FROM users WHERE role ILIKE '%TECHNICIAN%' OR role ILIKE '%TECHNICIAN%' LIMIT 1");
    }
    if (res.rows.length === 0) {
      res = await client.query('SELECT id, email, tenant_id, role FROM users LIMIT 1');
    }

    if (res.rows.length === 0) throw new Error('No users found in DB');
    const user = res.rows[0];

    function base64url(input) {
      return Buffer.from(input).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    }

    const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payloadObj = {
      email: user.email,
      sub: user.id,
      role: Array.isArray(user.role) ? user.role : [user.role],
      tenantId: user.tenant_id || user.tenantId || env.TENANT_ID || null,
      iat: Math.floor(Date.now()/1000),
    };
    const payload = base64url(JSON.stringify(payloadObj));
    const signature = crypto.createHmac('sha256', jwtSecret).update(`${header}.${payload}`).digest('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const token = `${header}.${payload}.${signature}`;

    console.log('== Generated token for user:', user.email, 'id:', user.id);
    console.log(token);
    console.log('tenantId used:', payloadObj.tenantId);

    // Prepare scan payload
    const scanPayload = {
      nfcTagId: 'MACH-2024-00247',
      nfcUid: '04:A3:B2:C1:D0:E9:F8',
      latitude: -33.4567,
      longitude: -70.6543,
      gpsAccuracy: 8.5,
      scannedAt: new Date().toISOString(),
    };

    const apiHost = process.env.API_HOST || 'https://friocheck-api.azurewebsites.net';
    const url = `${apiHost}/api/v1/machines/scan`;

    const headers = [
      `-H "Authorization: Bearer ${token}"`,
      `-H "Content-Type: application/json"`
    ];
    if (payloadObj.tenantId) headers.push(`-H "X-Tenant-Id: ${payloadObj.tenantId}"`);

    const curlCmd = `curl -i -s -X POST "${url}" ${headers.join(' ')} -d '${JSON.stringify(scanPayload)}'`;

    console.log('\n== Calling endpoint:', url);
    console.log('== Curl command:', curlCmd);

    const resp = execSync(curlCmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log('\n== Response from server:\n');
    console.log(resp);

    await client.end();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
