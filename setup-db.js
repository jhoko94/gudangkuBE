// Script untuk setup database baru
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log('🔌 Menguji koneksi database...');
        await prisma.$connect();
        console.log('✅ Koneksi database berhasil!\n');
        return true;
    } catch (error) {
        console.error('❌ Gagal terhubung ke database!');
        console.error('Error:', error.message);
        console.log('\n💡 Periksa:');
        console.log('   1. Apakah PostgreSQL server berjalan?');
        console.log('   2. Apakah DATABASE_URL di .env sudah benar?');
        console.log('   3. Apakah database sudah dibuat di pgAdmin?');
        console.log('   4. Apakah username dan password benar?');
        return false;
    }
}

async function checkTables() {
    try {
        console.log('📊 Memeriksa tabel di database...');
        // Cek apakah tabel Barang ada
        const count = await prisma.barang.count();
        console.log(`✅ Database sudah memiliki ${count} barang`);
        return true;
    } catch (error) {
        if (error.code === 'P2021' || error.message.includes('does not exist')) {
            console.log('⚠️  Tabel belum ada. Perlu menjalankan migrasi.');
            return false;
        }
        throw error;
    }
}

async function main() {
    console.log('🚀 Setup Database Baru\n');
    console.log('='.repeat(50));
    
    // 1. Test koneksi
    const connected = await testConnection();
    if (!connected) {
        process.exit(1);
    }
    
    // 2. Cek tabel
    const tablesExist = await checkTables();
    
    if (!tablesExist) {
        console.log('\n📝 Langkah selanjutnya:');
        console.log('   1. Jalankan: npx prisma migrate dev');
        console.log('   2. Setelah migrasi selesai, jalankan: npm run seed');
    } else {
        console.log('\n✅ Database sudah siap!');
        console.log('💡 Jika ingin menambahkan data demo, jalankan: npm run seed');
    }
    
    console.log('\n' + '='.repeat(50));
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

