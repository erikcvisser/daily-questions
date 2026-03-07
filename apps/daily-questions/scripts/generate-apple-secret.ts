// Usage: npx ts-node apps/daily-questions/scripts/generate-apple-secret.ts [path-to-.p8-file]
//
// Requires env vars: APPLE_KEY_ID, APPLE_TEAM_ID, APPLE_ID
// Plus either APPLE_PRIVATE_KEY env var or .p8 file path as first argument

import { SignJWT, importPKCS8 } from 'jose';
import * as fs from 'fs';

async function main() {
  const privateKeyArg = process.argv[2];
  let privateKey: string;

  if (privateKeyArg && fs.existsSync(privateKeyArg)) {
    privateKey = fs.readFileSync(privateKeyArg, 'utf8');
    console.log(`Read private key from ${privateKeyArg}`);
  } else if (process.env.APPLE_PRIVATE_KEY) {
    privateKey = process.env.APPLE_PRIVATE_KEY;
  } else {
    console.error('Provide .p8 file path as argument or set APPLE_PRIVATE_KEY env var');
    process.exit(1);
  }

  const keyId = process.env.APPLE_KEY_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  const clientId = process.env.APPLE_ID;

  if (!keyId || !teamId || !clientId) {
    console.error('Set APPLE_KEY_ID, APPLE_TEAM_ID, and APPLE_ID env vars');
    process.exit(1);
  }

  const key = await importPKCS8(privateKey, 'ES256');

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuedAt()
    .setExpirationTime('180d')
    .setAudience('https://appleid.apple.com')
    .setIssuer(teamId)
    .setSubject(clientId)
    .sign(key);

  console.log('\nGenerated Apple client secret (valid for 180 days):\n');
  console.log(token);
  console.log('\nSet this as AUTH_APPLE_SECRET in your environment.\n');
}

main().catch(console.error);
