// Script untuk cek database connection dan data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        console.log('🔍 Checking database connection...\n');
        
        // Tampilkan DATABASE_URL (disamarkan untuk security)
        const dbUrl = process.env.DATABASE_URL || 'NOT SET';
        if (dbUrl !== 'NOT SET') {
            // Mask password in URL
            const maskedUrl = dbUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
            console.log('DATABASE_URL:', maskedUrl);
            
            // Cek apakah Neon atau local
            if (dbUrl.includes('neon.tech') || dbUrl.includes('neon')) {
                console.log('📍 Database: Neon ✅');
            } else if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
                console.log('📍 Database: Local PostgreSQL');
            } else if (dbUrl.includes('railway')) {
                console.log('📍 Database: Railway');
            } else {
                console.log('📍 Database: Unknown');
            }
        } else {
            console.log('❌ DATABASE_URL not set!');
            console.log('💡 Please set DATABASE_URL in .env file');
            process.exit(1);
        }
        
        // Test connection
        console.log('\n🔌 Testing connection...');
        await prisma.$connect();
        console.log('✅ Connected successfully!\n');
        
        // Cek tabel
        console.log('📊 Checking tables and data...\n');
        
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `;
        
        console.log(`✅ Found ${tables.length} tables:`);
        tables.forEach(table => {
            console.log(`   - ${table.table_name}`);
        });
        
        // Cek data
        console.log('\n📦 Checking data...');
        
        try {
            const pemasokCount = await prisma.pemasok.count();
            const tujuanCount = await prisma.tujuan.count();
            const barangCount = await prisma.barang.count();
            
            console.log(`   - Pemasok: ${pemasokCount} records`);
            console.log(`   - Tujuan: ${tujuanCount} records`);
            console.log(`   - Barang: ${barangCount} records`);
            
            if (pemasokCount === 0 && tujuanCount === 0 && barangCount === 0) {
                console.log('\n⚠️  Database is empty!');
                console.log('💡 Run: npm run seed:safe');
            } else {
                console.log('\n✅ Database has data!');
            }
        } catch (error) {
            console.log('⚠️  Could not check data:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('Can\'t reach database server')) {
            console.log('\n💡 Troubleshooting:');
            console.log('   1. Check if DATABASE_URL is correct');
            console.log('   2. For Neon: Ensure connection string includes ?sslmode=require');
            console.log('   3. For local: Ensure PostgreSQL is running');
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();

