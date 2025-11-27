// Script untuk memeriksa apakah backend siap dijalankan
const fs = require('fs');
const path = require('path');

console.log('🔍 Memeriksa konfigurasi backend...\n');

// 1. Cek file .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ File .env tidak ditemukan!');
    console.log('📝 Buat file .env dengan isi:');
    console.log('   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gudang_db"');
    console.log('   atau gunakan DATABASE_URL dari Neon\n');
    process.exit(1);
} else {
    console.log('✅ File .env ditemukan');
}

// 2. Cek node_modules
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ node_modules tidak ditemukan!');
    console.log('📦 Jalankan: npm install\n');
    process.exit(1);
} else {
    console.log('✅ node_modules ditemukan');
}

// 3. Cek Prisma Client
const prismaClientPath = path.join(nodeModulesPath, '@prisma', 'client');
if (!fs.existsSync(prismaClientPath)) {
    console.log('❌ Prisma Client tidak ditemukan!');
    console.log('📦 Jalankan: npx prisma generate\n');
    process.exit(1);
} else {
    console.log('✅ Prisma Client ditemukan');
}

console.log('\n✅ Backend siap dijalankan!');
console.log('🚀 Jalankan: npm run dev\n');

