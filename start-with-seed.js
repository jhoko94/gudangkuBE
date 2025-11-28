// Script start yang menjalankan seed dulu (jika perlu), lalu start server
const { spawn } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndSeed() {
    try {
        // Cek apakah data sudah ada
        const existingPemasok = await prisma.pemasok.count();
        const existingTujuan = await prisma.tujuan.count();
        const existingBarang = await prisma.barang.count();

        // Jika belum ada data, jalankan seed
        if (existingPemasok === 0 && existingTujuan === 0 && existingBarang === 0) {
            console.log('🌱 Database kosong, menjalankan seed...');
            const seedProcess = spawn('node', ['seed-demo-safe.js'], {
                stdio: 'inherit',
                shell: true
            });

            await new Promise((resolve, reject) => {
                seedProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log('✅ Seed selesai');
                        resolve();
                    } else {
                        console.log('⚠️  Seed gagal, lanjut start server');
                        resolve(); // Tetap lanjut start server
                    }
                });
                seedProcess.on('error', (err) => {
                    console.error('⚠️  Error running seed:', err);
                    resolve(); // Tetap lanjut start server
                });
            });
        } else {
            console.log('✅ Data sudah ada, skip seeding');
        }
    } catch (error) {
        console.error('⚠️  Error checking/seeding:', error.message);
        // Tetap lanjut start server meskipun seed error
    } finally {
        await prisma.$disconnect();
    }
}

async function start() {
    // Jalankan seed dulu (jika perlu)
    await checkAndSeed();

    // Start server
    console.log('🚀 Starting server...');
    const serverProcess = spawn('node', ['index.js'], {
        stdio: 'inherit',
        shell: true
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

