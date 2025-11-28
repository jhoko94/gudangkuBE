// Script start sederhana yang menjalankan migrate dulu
const { execSync } = require('child_process');
const { spawn } = require('child_process');

console.log('🚀 Starting production server...');
console.log('='.repeat(50));
console.log('Current directory:', process.cwd());
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌');

// 1. Jalankan migrate dulu
try {
    console.log('\n🔄 Running database migrations...');
    console.log('Command: npx prisma migrate deploy');
    
    execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: process.env,
        cwd: process.cwd(),
        shell: true
    });
    
    console.log('\n✅ Migrations completed successfully');
} catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('Error:', error.message);
    if (error.stdout) console.error('Stdout:', error.stdout.toString());
    if (error.stderr) console.error('Stderr:', error.stderr.toString());
    console.error('\n⚠️  Continuing with server start anyway...');
    console.error('💡 Check logs above for migration errors');
}

// 2. Start server
console.log('\n' + '='.repeat(50));
console.log('🚀 Starting Express server...');
const serverProcess = spawn('node', ['index.js'], {
    stdio: 'inherit',
    shell: true,
    env: process.env
});

serverProcess.on('error', (err) => {
    console.error('❌ Error starting server:', err);
    process.exit(1);
});

serverProcess.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
});

