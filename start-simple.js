// Script start sederhana yang menjalankan migrate dulu
const { execSync } = require('child_process');

console.log('🚀 Starting production server...');
console.log('='.repeat(50));

// 1. Jalankan migrate dulu
try {
    console.log('🔄 Running database migrations...');
    execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: process.env
    });
    console.log('✅ Migrations completed');
} catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('⚠️  Continuing anyway...');
}

// 2. Start server
console.log('='.repeat(50));
console.log('🚀 Starting Express server...');
require('./index.js');

