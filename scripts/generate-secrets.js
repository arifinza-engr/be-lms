#!/usr/bin/env node

/**
 * Generate Secure Secrets for Production Environment
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateSecureSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateSecrets() {
  const secrets = {
    JWT_SECRET: generateSecureSecret(32),
    JWT_REFRESH_SECRET: generateSecureSecret(32),
    SESSION_SECRET: generateSecureSecret(32),
    COOKIE_SECRET: generateSecureSecret(32),
    ENCRYPTION_KEY: generateSecureSecret(32),
  };

  console.log('🔐 Generated Secure Secrets for Production:');
  console.log('='.repeat(50));

  Object.entries(secrets).forEach(([key, value]) => {
    console.log(`${key}="${value}"`);
  });

  console.log('='.repeat(50));
  console.log('');
  console.log('⚠️  IMPORTANT SECURITY NOTES:');
  console.log(
    '1. Store these secrets securely (use environment variables or secret management)',
  );
  console.log('2. Never commit these secrets to version control');
  console.log(
    '3. Use different secrets for each environment (dev, staging, prod)',
  );
  console.log('4. Rotate secrets regularly');
  console.log('');

  // Optionally save to a secure file
  const secretsFile = path.join(__dirname, '..', '.env.secrets');
  const secretsContent = Object.entries(secrets)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');

  try {
    fs.writeFileSync(secretsFile, secretsContent + '\n');
    console.log(`✅ Secrets saved to: ${secretsFile}`);
    console.log('⚠️  Remember to add .env.secrets to .gitignore!');
  } catch (error) {
    console.error('❌ Failed to save secrets file:', error.message);
  }

  return secrets;
}

// Generate and display secrets
if (require.main === module) {
  generateSecrets();
}

module.exports = { generateSecrets, generateSecureSecret };
