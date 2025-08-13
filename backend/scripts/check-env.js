// Debug script to check environment variables
require('dotenv').config({ path: '../../.env' });

console.log('Environment Variables:');
console.log('---------------------');
console.log(`GMAIL_USER: ${process.env.GMAIL_USER ? '***' : 'NOT SET'}`);
console.log(`GMAIL_PASS: ${process.env.GMAIL_PASS ? '*** (length: ' + process.env.GMAIL_PASS.length + ')' : 'NOT SET'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Check if .env file is being read
const fs = require('fs');
const envPath = require('path').resolve(__dirname, '../../.env');
console.log('\n.env file path:', envPath);
console.log('.env file exists:', fs.existsSync(envPath));
