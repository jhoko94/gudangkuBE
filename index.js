const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
const app = express();

app.use(cors());
app.use(express.json());

// Wrapper untuk error handling di route async
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ===================================
// API untuk DASHBOARD (Requirement #1)
// ===================================
app.get('/api/dashboard', asyncHandler(async (req, res) => {
    // 1. PO Outstanding
    const poOutstandingCount = await prisma.purchaseOrder.count({
        where: { status: { not: 'Selesai' } }
    });

    // 2. Barang Keluar Hari Ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const barangKeluarHariIni = await prisma.outboundLog.count({
        where: {
            tanggal: {
                gte: today,
                lt: tomorrow,
            }
        }
    });

    // 3. Stok Kritis (Ini query yang kompleks)
    // Ambil semua barang
    const allBarang = await prisma.barang.findMany();
    // Ambil semua stok
    const allStok = await prisma.itemBarcode.groupBy({
        by: ['barangId'],
        where: { status: 'available' },
        _count: { barcode: true }
    });

    // Ubah allStok menjadi Map untuk lookup cepat
    const stokMap = new Map(
        allStok.map(item => [item.barangId, item._count.barcode])
    );

    let stokKritisCount = 0;
    const stokKritisList = [];

    allBarang.forEach(barang => {
        const stok = stokMap.get(barang.id) || 0;
        if (stok <= barang.batasMin) {
            stokKritisCount++;
            stokKritisList.push({
                ...barang,
                stok: stok,
            });
        }
    });

    res.json({
        statStokKritis: stokKritisCount,
        statPoOutstanding: poOutstandingCount,
        statBarangKeluar: barangKeluarHariIni,
        stokKritisList: stokKritisList,
    });
}));

// ===================================
// API MASTER BARANG (Requirement #2)
// ===================================
app.get('/api/barang', asyncHandler(async (req, res) => {
    const barang = await prisma.barang.findMany();
    res.json(barang);
}));

app.post('/api/barang', asyncHandler(async (req, res) => {
    const { id, nama, satuan, batasMin } = req.body;
    const newBarang = await prisma.barang.create({
        data: { id, nama, satuan, batasMin: parseInt(batasMin) }
    });
    res.status(201).json(newBarang);
}));

app.put('/api/barang/:id', asyncHandler(async (req, res) => {
    const { id: oldId } = req.params;
    const { id, nama, satuan, batasMin } = req.body;
    
    // Ini adalah operasi yang rumit jika ID diubah,
    // karena ID adalah foreign key. 
    // Untuk prototipe, kita asumsikan ID tidak diubah saat edit,
    // atau jika diubah, ID baru harus unik.
    // Kode di FE memperbolehkan ganti ID.
    
    // Jika ID diubah, kita harus pakai transaction
    if (oldId !== id) {
         // Cek dulu apakah ID baru sudah ada
        const existing = await prisma.barang.findUnique({ where: { id }});
        if (existing) {
            return res.status(409).json({ message: 'Kode Barang (SKU) baru sudah ada' });
        }
        
        // Karena ID adalah PK, kita tidak bisa 'update' ID.
        // Cara yang benar adalah SANGAT RUMIT (ganti semua FK).
        // Cara 'prototipe' adalah update data lain, tapi ID tetap.
        // Mari kita ikuti logika FE (boleh ganti ID)
        
        // INI HANYA UNTUK PROTOTIPE - JANGAN LAKUKAN INI DI PRODUKSI
        // Operasi ini tidak aman
        try {
            await prisma.$transaction(async (tx) => {
                // 1. Buat barang baru dengan ID baru
                const newBarang = await tx.barang.create({
                    data: { id, nama, satuan, batasMin: parseInt(batasMin) }
                });
                
                // 2. Update semua relasi (ini bagian yang sulit & rawan)
                await tx.itemBarcode.updateMany({ where: { barangId: oldId }, data: { barangId: id } });
                await tx.poItem.updateMany({ where: { barangId: oldId }, data: { barangId: id } });
                
                // 3. Hapus barang lama
                await tx.barang.delete({ where: { id: oldId } });
                
                res.json(newBarang);
            });
        } catch (e) {
            // Jika gagal (misal ID baru sudah ada), kirim error
            res.status(409).json({ message: 'Gagal mengubah ID. Kode Barang (SKU) baru mungkin sudah ada atau sedang digunakan.', error: e.message });
        }
    } else {
        // ID tidak berubah, update biasa
        const updatedBarang = await prisma.barang.update({
            where: { id: oldId },
            data: { nama, satuan, batasMin: parseInt(batasMin) }
        });
        res.json(updatedBarang);
    }
}));

// ===================================
// API MASTER PEMASOK (Requirement #2)
// ===================================
app.get('/api/pemasok', asyncHandler(async (req, res) => {
    const pemasok = await prisma.pemasok.findMany();
    res.json(pemasok);
}));

app.post('/api/pemasok', asyncHandler(async (req, res) => {
    const { id, nama, kontak } = req.body;
    const newPemasok = await prisma.pemasok.create({
        data: { id, nama, kontak }
    });
    res.status(201).json(newPemasok);
}));

app.put('/api/pemasok/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nama, kontak } = req.body;
    const updatedPemasok = await prisma.pemasok.update({
        where: { id },
        data: { nama, kontak }
    });
    res.json(updatedPemasok);
}));


// ===================================
// API MASTER TUJUAN (Requirement #2)
// ===================================
app.get('/api/tujuan', asyncHandler(async (req, res) => {
    const tujuan = await prisma.tujuan.findMany();
    res.json(tujuan);
}));

app.post('/api/tujuan', asyncHandler(async (req, res) => {
    const { id, nama, tipe } = req.body;
    const newTujuan = await prisma.tujuan.create({
        data: { id, nama, tipe }
    });
    res.status(201).json(newTujuan);
}));

app.put('/api/tujuan/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nama, tipe } = req.body;
    const updatedTujuan = await prisma.tujuan.update({
        where: { id },
        data: { nama, tipe }
    });
    res.json(updatedTujuan);
}));


// ===================================
// API PURCHASE ORDER (PO) (Requirement #3)
// ===================================
app.get('/api/po', asyncHandler(async (req, res) => {
    const pos = await prisma.purchaseOrder.findMany({
        include: { pemasok: true },
        orderBy: { createdAt: 'desc' }
    });
    res.json(pos);
}));

// Untuk `viewPODetail`
app.get('/api/po/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const po = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: {
            pemasok: true,
            items: {
                include: {
                    barang: true,
                }
            }
        }
    });
    if (!po) {
        return res.status(404).json({ message: 'PO tidak ditemukan' });
    }
    res.json(po);
}));

// Untuk `submitPOBaru`
app.post('/api/po', asyncHandler(async (req, res) => {
    const { id, tanggal, pemasokId, items } = req.body; // items = [{ barangId, jumlahPesan }]

    if (!id || !tanggal || !pemasokId || !items || items.length === 0) {
        return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const newPO = await prisma.$transaction(async (tx) => {
        const po = await tx.purchaseOrder.create({
            data: {
                id,
                tanggal: new Date(tanggal),
                status: 'Outstanding',
                pemasokId,
            }
        });

        const poItemsData = items.map(item => ({
            poId: po.id,
            barangId: item.barangId,
            jumlahPesan: parseInt(item.jumlahPesan)
        }));

        await tx.poItem.createMany({
            data: poItemsData
        });

        return po;
    });

    res.status(201).json(newPO);
}));


// ===================================
// API INBOUND (Terima Barang) (Requirement #4)
// ===================================
// Untuk `lookupPO` (bisa pakai `GET /api/po/:id` di atas)
// Cek jika PO ada
app.get('/api/po/lookup/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const po = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: {
            pemasok: true,
            items: {
                include: {
                    barang: true,
                }
            },
            receivedItems: true // Untuk cek barang yang sudah diterima
        }
    });

    if (!po) {
        return res.status(404).json({ message: 'PO tidak ditemukan' });
    }
    
    // Kirim data yang sudah diformat untuk FE
    const poItemsMap = new Map(po.items.map(item => [item.barangId, { jumlahPesan: item.jumlahPesan, barang: item.barang }]));
    
    // Hitung yang sudah diterima
    po.receivedItems.forEach(item => {
        if(poItemsMap.has(item.barangId)) {
            poItemsMap.get(item.barangId).jumlahDiterima = (poItemsMap.get(item.barangId).jumlahDiterima || 0) + 1;
        }
    });

    res.json({
        id: po.id,
        status: po.status,
        pemasok: po.pemasok,
        items: Array.from(poItemsMap.values()).map(item => ({
            barangId: item.barang.id,
            nama: item.barang.nama,
            satuan: item.barang.satuan,
            jumlahPesan: item.jumlahPesan,
            jumlahDiterima: item.jumlahDiterima || 0
        }))
    });
}));

// Untuk `submitPenerimaanScan`
app.post('/api/inbound', asyncHandler(async (req, res) => {
    const { poId, scannedItems } = req.body; // scannedItems = { "B001": ["bc1", "bc2"], "B002": ["bc3"] }

    // 1. Validasi barcode unik di database
    const allBarcodes = Object.values(scannedItems).flat();
    if (allBarcodes.length === 0) {
        return res.status(400).json({ message: 'Tidak ada barang di-scan' });
    }

    const existingBarcodes = await prisma.itemBarcode.findMany({
        where: { barcode: { in: allBarcodes } }
    });

    if (existingBarcodes.length > 0) {
        return res.status(409).json({
            message: 'Barcode sudah terdaftar di sistem',
            existing: existingBarcodes.map(b => b.barcode)
        });
    }

    // 2. Siapkan data untuk `createMany`
    const itemBarcodeData = [];
    for (const barangId in scannedItems) {
        for (const barcode of scannedItems[barangId]) {
            itemBarcodeData.push({
                barcode,
                status: 'available',
                barangId,
                poId,
            });
        }
    }

    // 3. Jalankan Transaksi
    await prisma.$transaction(async (tx) => {
        // 3.1. Buat semua item barcode
        await tx.itemBarcode.createMany({
            data: itemBarcodeData
        });

        // 3.2. Update status PO
        const po = await tx.purchaseOrder.findUnique({
            where: { id: poId },
            include: {
                items: true, // PoItem
                receivedItems: true // ItemBarcode
            }
        });

        let isSelesai = true;
        for (const poItem of po.items) {
            const totalDiterima = po.receivedItems.filter(item => item.barangId === poItem.barangId).length;
            if (totalDiterima < poItem.jumlahPesan) {
                isSelesai = false;
                break;
            }
        }

        const newStatus = isSelesai ? 'Selesai' : 'Sebagian';
        
        await tx.purchaseOrder.update({
            where: { id: poId },
            data: { status: newStatus }
        });
    });

    res.status(201).json({ message: `${allBarcodes.length} barang berhasil diterima.` });
}));

// ===================================
// API OUTBOUND (Keluarkan Barang) (Requirement #5)
// ===================================
// Untuk `processOutboundScan`
app.get('/api/barcode/:barcode', asyncHandler(async (req, res) => {
    const { barcode } = req.params;

    const item = await prisma.itemBarcode.findUnique({
        where: { barcode },
        include: {
            barang: true,
            purchaseOrder: {
                include: {
                    pemasok: true
                }
            }
        }
    });

    if (!item) {
        return res.status(404).json({ message: 'Barcode tidak terdaftar' });
    }
    if (item.status !== 'available') {
        return res.status(409).json({ message: `Barcode tidak tersedia (Status: ${item.status})` });
    }

    // Kirim data yang dibutuhkan FE
    res.json({
        barcode: item.barcode,
        namaBarang: item.barang.nama,
        namaVendor: item.purchaseOrder.pemasok.nama
    });
}));

// Untuk `submitPengeluaranScan`
app.post('/api/outbound', asyncHandler(async (req, res) => {
    const { tujuanId, referensi, barcodes } = req.body; // barcodes = ["bc1", "bc2"]

    if (!tujuanId || !barcodes || barcodes.length === 0) {
        return res.status(400).json({ message: 'Tujuan dan barcode wajib diisi' });
    }

    await prisma.$transaction(async (tx) => {
        // 1. Update status barcode
        const updated = await tx.itemBarcode.updateMany({
            where: {
                barcode: { in: barcodes },
                status: 'available' // Pastikan hanya yg available yg diubah
            },
            data: { status: 'keluar' }
        });

        // Jika jumlah yg diupdate tidak sama, berarti ada barcode yg tidak valid
        if (updated.count !== barcodes.length) {
            throw new Error('Beberapa barcode tidak valid atau tidak tersedia');
        }

        // 2. Buat log
        const logData = barcodes.map(barcode => ({
            barcode,
            tujuanId,
            referensi,
        }));

        await tx.outboundLog.createMany({
            data: logData
        });
    });

    res.status(201).json({ message: `${barcodes.length} barang berhasil dikeluarkan` });
}));

// ===================================
// API STOK (Requirement #6)
// ===================================
// Untuk `renderStokTable`
app.get('/api/stok', asyncHandler(async (req, res) => {
    // 1. Ambil semua barang
    const allBarang = await prisma.barang.findMany();
    
    // 2. Ambil semua stok
    const allStok = await prisma.itemBarcode.groupBy({
        by: ['barangId'],
        where: { status: 'available' },
        _count: { barcode: true }
    });

    // 3. Gabungkan
    const stokMap = new Map(
        allStok.map(item => [item.barangId, item._count.barcode])
    );

    const stokList = allBarang.map(barang => ({
        ...barang,
        stok: stokMap.get(barang.id) || 0
    }));

    res.json(stokList);
}));

// Untuk `submitScrap`
app.post('/api/scrap', asyncHandler(async (req, res) => {
    // FE idealnya mengirim list barcode yang di-scrap.
    // Kita buat API-nya menerima list barcode.
    const { barcodes, catatan } = req.body; // barcodes = ["bc1", "bc2"]

    if (!barcodes || barcodes.length === 0) {
        return res.status(400).json({ message: 'Barcode wajib diisi' });
    }

    const updated = await prisma.itemBarcode.updateMany({
        where: {
            barcode: { in: barcodes },
            status: 'available' // Hanya bisa scrap barang yg tersedia
        },
        data: {
            status: 'scrap'
            // Kita bisa tambahkan field 'catatanScrap' di ItemBarcode jika perlu
        }
    });
    
    if (updated.count === 0) {
        return res.status(404).json({ message: 'Tidak ada barcode valid/available yang ditemukan' });
    }

    res.json({ message: `${updated.count} barang berhasil dicatat sebagai scrap` });
}));


// ===================================
// Error Handler
// ===================================
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Handle error Prisma
    if (err.code === 'P2002') { // Unique constraint violation
        const target = err.meta?.target;
        return res.status(409).json({ message: `Data duplikat: ${target}` });
    }
    if (err.code === 'P2025') { // Record not found
        return res.status(404).json({ message: 'Data tidak ditemukan' });
    }
    
    res.status(500).json({ message: 'Terjadi kesalahan di server', error: err.message });
});


// ===================================
// Start Server
// ===================================
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`🚀 Server sekarang berjalan di http://${HOST}:${PORT}`);
});