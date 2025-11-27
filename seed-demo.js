// Script untuk menambahkan master data demo
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Mulai seeding master data demo...\n');

    // 1. Master Pemasok (Suppliers)
    console.log('📦 Menambahkan Master Pemasok...');
    const pemasokData = [
        { id: 'P001', nama: 'PT Sumber Makmur Jaya', kontak: '081234567890' },
        { id: 'P002', nama: 'CV Barokah Sejahtera', kontak: '081234567891' },
        { id: 'P003', nama: 'UD Mandiri Abadi', kontak: '081234567892' },
        { id: 'P004', nama: 'PT Global Supply Chain', kontak: '081234567893' },
        { id: 'P005', nama: 'CV Mitra Bersama', kontak: '081234567894' },
    ];

    for (const pemasok of pemasokData) {
        try {
            await prisma.pemasok.upsert({
                where: { id: pemasok.id },
                update: pemasok,
                create: pemasok,
            });
            console.log(`  ✅ ${pemasok.id} - ${pemasok.nama}`);
        } catch (error) {
            console.log(`  ⚠️  ${pemasok.id} - ${error.message}`);
        }
    }

    // 2. Master Tujuan (Destinations)
    console.log('\n🎯 Menambahkan Master Tujuan...');
    const tujuanData = [
        { id: 'T001', nama: 'Produksi Line A', tipe: 'Internal' },
        { id: 'T002', nama: 'Produksi Line B', tipe: 'Internal' },
        { id: 'T003', nama: 'Gudang Distribusi', tipe: 'Internal' },
        { id: 'T004', nama: 'Customer Jakarta', tipe: 'Eksternal' },
        { id: 'T005', nama: 'Customer Bandung', tipe: 'Eksternal' },
        { id: 'T006', nama: 'Customer Surabaya', tipe: 'Eksternal' },
        { id: 'T007', nama: 'Retur ke Supplier', tipe: 'Eksternal' },
    ];

    for (const tujuan of tujuanData) {
        try {
            await prisma.tujuan.upsert({
                where: { id: tujuan.id },
                update: tujuan,
                create: tujuan,
            });
            console.log(`  ✅ ${tujuan.id} - ${tujuan.nama} (${tujuan.tipe})`);
        } catch (error) {
            console.log(`  ⚠️  ${tujuan.id} - ${error.message}`);
        }
    }

    // 3. Master Barang (Items)
    console.log('\n📦 Menambahkan Master Barang...');
    const barangData = [
        // Kategori: Elektronik
        { id: 'B001', nama: 'Laptop Dell Inspiron 15', satuan: 'unit', batasMin: 5 },
        { id: 'B002', nama: 'Mouse Wireless Logitech', satuan: 'unit', batasMin: 20 },
        { id: 'B003', nama: 'Keyboard Mechanical', satuan: 'unit', batasMin: 15 },
        { id: 'B004', nama: 'Monitor LED 24 inch', satuan: 'unit', batasMin: 10 },
        { id: 'B005', nama: 'Webcam HD 1080p', satuan: 'unit', batasMin: 12 },
        
        // Kategori: Perkakas
        { id: 'B006', nama: 'Obeng Set 10 pcs', satuan: 'set', batasMin: 8 },
        { id: 'B007', nama: 'Tang Kombinasi', satuan: 'unit', batasMin: 15 },
        { id: 'B008', nama: 'Palu Besi', satuan: 'unit', batasMin: 10 },
        { id: 'B009', nama: 'Bor Listrik', satuan: 'unit', batasMin: 5 },
        { id: 'B010', nama: 'Gergaji Besi', satuan: 'unit', batasMin: 8 },
        
        // Kategori: Bahan Baku
        { id: 'B011', nama: 'Kawat Tembaga 2.5mm', satuan: 'roll', batasMin: 20 },
        { id: 'B012', nama: 'Pipa PVC 1/2 inch', satuan: 'batang', batasMin: 30 },
        { id: 'B013', nama: 'Sekrup Baja 3x20mm', satuan: 'box', batasMin: 25 },
        { id: 'B014', nama: 'Cat Tembok Putih', satuan: 'kaleng', batasMin: 15 },
        { id: 'B015', nama: 'Lem Epoxy', satuan: 'tube', batasMin: 20 },
        
        // Kategori: Safety Equipment
        { id: 'B016', nama: 'Helm Safety', satuan: 'unit', batasMin: 30 },
        { id: 'B017', nama: 'Sarung Tangan Karet', satuan: 'pasang', batasMin: 50 },
        { id: 'B018', nama: 'Masker N95', satuan: 'box', batasMin: 40 },
        { id: 'B019', nama: 'Sepatu Safety', satuan: 'pasang', batasMin: 20 },
        { id: 'B020', nama: 'Kacamata Safety', satuan: 'unit', batasMin: 25 },
        
        // Kategori: Office Supplies
        { id: 'B021', nama: 'Kertas A4 80gsm', satuan: 'rim', batasMin: 30 },
        { id: 'B022', nama: 'Pulpen Hitam', satuan: 'box', batasMin: 40 },
        { id: 'B023', nama: 'Stapler Besar', satuan: 'unit', batasMin: 10 },
        { id: 'B024', nama: 'Isi Stapler No.10', satuan: 'box', batasMin: 20 },
        { id: 'B025', nama: 'Map Folder', satuan: 'pack', batasMin: 25 },
    ];

    for (const barang of barangData) {
        try {
            await prisma.barang.upsert({
                where: { id: barang.id },
                update: barang,
                create: barang,
            });
            console.log(`  ✅ ${barang.id} - ${barang.nama} (Min: ${barang.batasMin} ${barang.satuan})`);
        } catch (error) {
            console.log(`  ⚠️  ${barang.id} - ${error.message}`);
        }
    }

    console.log('\n✅ Seeding master data selesai!');
    console.log('\n📊 Ringkasan:');
    console.log(`   - Pemasok: ${pemasokData.length} data`);
    console.log(`   - Tujuan: ${tujuanData.length} data`);
    console.log(`   - Barang: ${barangData.length} data`);
    console.log('\n💡 Tips:');
    console.log('   - Gunakan data ini untuk membuat PO');
    console.log('   - Beberapa barang memiliki batas minimum rendah untuk demo stok kritis');
    console.log('   - Data sudah menggunakan upsert, aman dijalankan berulang kali');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

