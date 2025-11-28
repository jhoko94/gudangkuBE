// Script start untuk production yang menjalankan migrate, seed (jika perlu), lalu start server
const { spawn, execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runMigrations() {
    try {
        console.log('🔄 Running database migrations...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌');
        
        if (!process.env.DATABASE_URL) {
            console.error('❌ DATABASE_URL not set! Cannot run migrations.');
            console.error('⚠️  Please set DATABASE_URL in Railway Variables');
            return false;
        }
        
        execSync('npx prisma migrate deploy', {
            stdio: 'inherit',
            env: process.env,
            cwd: process.cwd()
        });
        console.log('✅ Migrations completed successfully');
        return true;
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Error details:', error);
        console.error('⚠️  Continuing with server start anyway...');
        console.error('💡 You may need to run migrations manually: npx prisma migrate deploy');
        return false;
    }
}

async function checkAndSeed() {
    try {
        // Cek apakah data sudah ada
        const existingPemasok = await prisma.pemasok.count();
        const existingTujuan = await prisma.tujuan.count();
        const existingBarang = await prisma.barang.count();

        console.log(`📊 Current data: Pemasok=${existingPemasok}, Tujuan=${existingTujuan}, Barang=${existingBarang}`);

        // Jika belum ada data, jalankan seed
        if (existingPemasok === 0 && existingTujuan === 0 && existingBarang === 0) {
            console.log('🌱 Database kosong, menjalankan seed...');
            const seedProcess = spawn('node', ['seed-demo-safe.js'], {
                stdio: 'inherit',
                shell: true,
                env: process.env
            });

            await new Promise((resolve) => {
                seedProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log('✅ Seed selesai');
                    } else {
                        console.log('⚠️  Seed gagal, lanjut start server');
                    }
                    resolve();
                });
                seedProcess.on('error', (err) => {
                    console.error('⚠️  Error running seed:', err);
                    resolve();
                });
            });
        } else {
            console.log('✅ Data sudah ada, skip seeding');
        }
    } catch (error) {
        console.error('⚠️  Error checking/seeding:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

async function start() {
    console.log('🚀 Starting production server...');
    console.log('='.repeat(50));
    
    // 1. Jalankan migrate dulu (database sudah ready saat start)
    const migrateSuccess = await runMigrations();
    
    if (!migrateSuccess) {
        console.log('⚠️  Migration failed, but continuing...');
        console.log('💡 You may need to run migrations manually');
    }
    
    // 2. Jalankan seed (jika perlu)
    await checkAndSeed();

    // 3. Start server
    console.log('='.repeat(50));
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
}

start();

