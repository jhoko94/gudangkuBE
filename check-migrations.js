// Script untuk cek status migrations
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function checkMigrations() {
    try {
        console.log('🔍 Checking migration status...\n');
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌');
        
        if (!process.env.DATABASE_URL) {
            console.error('❌ DATABASE_URL not set!');
            process.exit(1);
        }

        // Cek koneksi database
        console.log('\n1. Testing database connection...');
        await prisma.$connect();
        console.log('✅ Database connected');

        // Cek apakah tabel sudah ada
        console.log('\n2. Checking existing tables...');
        try {
            const tables = await prisma.$queryRaw`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            `;
            
            if (tables.length === 0) {
                console.log('⚠️  No tables found in database');
                console.log('💡 Need to run migrations');
            } else {
                console.log(`✅ Found ${tables.length} tables:`);
                tables.forEach(table => {
                    console.log(`   - ${table.table_name}`);
                });
            }
        } catch (error) {
            console.error('❌ Error checking tables:', error.message);
        }

        // Cek migration status via Prisma
        console.log('\n3. Checking Prisma migration status...');
        try {
            const result = execSync('npx prisma migrate status', {
                encoding: 'utf-8',
                env: process.env
            });
            console.log(result);
        } catch (error) {
            console.log('Migration status output:', error.stdout || error.message);
        }

        // Cek _prisma_migrations table
        console.log('\n4. Checking _prisma_migrations table...');
        try {
            const migrations = await prisma.$queryRaw`
                SELECT migration_name, finished_at, applied_steps_count
                FROM _prisma_migrations
                ORDER BY finished_at DESC;
            `;
            
            if (migrations.length === 0) {
                console.log('⚠️  No migrations found in _prisma_migrations table');
                console.log('💡 Database needs to be migrated');
            } else {
                console.log(`✅ Found ${migrations.length} applied migrations:`);
                migrations.forEach(m => {
                    console.log(`   - ${m.migration_name} (${m.applied_steps_count} steps)`);
                });
            }
        } catch (error) {
            if (error.message.includes('does not exist') || error.message.includes('relation "_prisma_migrations" does not exist')) {
                console.log('⚠️  _prisma_migrations table does not exist');
                console.log('💡 Database has not been migrated yet');
            } else {
                console.error('❌ Error checking migrations:', error.message);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

checkMigrations();

