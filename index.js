const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
const app = express();

app.use(cors());
app.use(express.json());

// Root endpoint - health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Backend Gudangku is alive!',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Wrapper untuk error handling di route async
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('Error in async handler:', error);
    next(error);
  });
};

// ===================================
// API untuk DASHBOARD (Requirement #1)
// ===================================
app.get('/api/dashboard', asyncHandler(async (req, res) => {
    try {
        // 1. PO Outstanding (Sama)
        let poOutstandingCount = 0;
        try {
            poOutstandingCount = await prisma.purchaseOrder.count({
                where: { status: { not: 'Selesai' } }
            });
        } catch (error) {
            console.warn('Error counting PO Outstanding:', error.message);
            // Lanjutkan dengan nilai default
        }

        // 2. Barang Keluar Hari Ini (Sama)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let barangKeluarHariIni = 0;
        try {
            barangKeluarHariIni = await prisma.outboundLog.count({
                where: {
                    tanggal: {
                        gte: today,
                        lt: tomorrow,
                    }
                }
            });
        } catch (error) {
            console.warn('Error counting barang keluar:', error.message);
            // Lanjutkan dengan nilai default
        }

        // 3. Stok Kritis (LOGIKA BARU - v4)

        // 3.1. Dapatkan stok TOTAL saat ini (Sama)
        let allStok = [];
        try {
            allStok = await prisma.itemBarcode.groupBy({
                by: ['barangId'],
                where: { status: 'available' },
                _count: { barcode: true }
            });
        } catch (error) {
            console.warn('Error grouping stok:', error.message);
            // Lanjutkan dengan array kosong
        }
        const stokMap = new Map(allStok.map(item => [item.barangId, item._count.barcode]));

        // 3.2. Dapatkan *semua* barang master (Sama)
        let allBarang = [];
        try {
            allBarang = await prisma.barang.findMany();
        } catch (error) {
            console.error('Error fetching barang:', error.message);
            // Jika error, kirim response dengan data kosong
            return res.json({
                statStokKritis: 0,
                statPoOutstanding: poOutstandingCount,
                statBarangKeluar: barangKeluarHariIni,
                groupedStokKritis: [],
            });
        }

    // 3.3. Tentukan barang apa saja yang kritis (berdasarkan STOK TOTAL)
    let stokKritisCount = 0;
    const criticalBarangIds = []; // Daftar ID barang yang kritis
    const criticalBarangMap = new Map(); // Map<barangId, barangMaster>

    allBarang.forEach(barang => {
        const stok = stokMap.get(barang.id) || 0;
        if (stok <= barang.batasMin) {
            stokKritisCount++;
            criticalBarangIds.push(barang.id);
            criticalBarangMap.set(barang.id, { ...barang, totalStok: stok }); // Simpan info barang kritis
        }
    });

    if (criticalBarangIds.length === 0) {
        // Jika tidak ada barang kritis, kirim respons kosong lebih awal
        return res.json({
            statStokKritis: 0,
            statPoOutstanding: poOutstandingCount,
            statBarangKeluar: barangKeluarHariIni,
            groupedStokKritis: [],
        });
    }

    // 3.4. (INI KUNCINYA) Ambil SEMUA barcode yang 'available'
    //      HANYA untuk barang yang kritis
    // Gunakan select untuk menghindari error jika relasi tidak ada
    let availableBarcodesForCriticalItems = [];
    try {
        availableBarcodesForCriticalItems = await prisma.itemBarcode.findMany({
            where: {
                barangId: { in: criticalBarangIds },
                status: 'available'
            },
            include: {
                purchaseOrder: { // Ambil PO terkait
                    include: {
                        pemasok: {
                            select: {
                                id: true,
                                nama: true
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching barcodes for critical items:', error.message);
        // Jika error, lanjutkan dengan array kosong
        availableBarcodesForCriticalItems = [];
    }
    
    // 3.5. Proses dan Kelompokkan berdasarkan Pemasok
    // Map<pemasokId, { pemasokId, namaPemasok, items: Map<barangId, {stok: int, ...barang}> }>
    const groupedKritis = new Map();

    availableBarcodesForCriticalItems.forEach(barcode => {
        try {
            const pemasok = barcode.purchaseOrder?.pemasok;
            const barangId = barcode.barangId;

            // Skip jika barangId tidak ada di criticalBarangMap (safety check)
            if (!criticalBarangMap.has(barangId)) {
                return;
            }

            // Tentukan grup
            const pemasokId = pemasok?.id || 'unknown';
            const pemasokNama = pemasok?.nama || 'Tanpa Pemasok';

            // Buat grup Pemasok jika belum ada
            if (!groupedKritis.has(pemasokId)) {
                groupedKritis.set(pemasokId, {
                    pemasokId: pemasokId,
                    namaPemasok: pemasokNama,
                    items: new Map() // Gunakan Map untuk de-duplikasi barang
                });
            }
            const supplierGroup = groupedKritis.get(pemasokId);

            // Buat entri barang di dalam grup jika belum ada
            if (!supplierGroup.items.has(barangId)) {
                const barangMaster = criticalBarangMap.get(barangId); // Ambil info master
                if (barangMaster) {
                    supplierGroup.items.set(barangId, {
                        ...barangMaster,
                        stok: 0 // Mulai hitungan stok DARI PEMASOK INI dari 0
                    });
                }
            }
            
            // Tambahkan 1 ke stok barang ini DARI PEMASOK INI
            const item = supplierGroup.items.get(barangId);
            if (item) {
                item.stok++;
            }
        } catch (error) {
            // Skip barcode yang error, log untuk debugging
            console.warn('Error processing barcode:', barcode.barcode, error.message);
        }
    });


    // 3.6. Konversi hasil Map menjadi Array
    const finalGroupedList = Array.from(groupedKritis.values()).map(group => ({
        ...group,
        items: Array.from(group.items.values()) // Ubah Map 'items' menjadi array
    }));

    // Kirim respons
    res.json({
        statStokKritis: stokKritisCount, // Ini tetap total count (e.g. 2 barang kritis)
        statPoOutstanding: poOutstandingCount,
        statBarangKeluar: barangKeluarHariIni,
        groupedStokKritis: finalGroupedList,
    });
    } catch (error) {
        // Tangkap error yang tidak tertangani di try-catch sebelumnya
        console.error('Unexpected error in dashboard endpoint:', error);
        throw error; // Lempar ke error handler global
    }
}));

// ===================================
// API MASTER BARANG (Requirement #2)
// ===================================
app.get('/api/barang', asyncHandler(async (req, res) => {
    try {
        const barang = await prisma.barang.findMany();
        res.json(barang);
    } catch (error) {
        console.error('Error fetching barang:', error);
        res.json([]); // Return empty array on error
    }
}));

app.post('/api/barang', asyncHandler(async (req, res) => {
    const { id, nama, satuan, batasMin } = req.body;
    const newBarang = await prisma.barang.create({
        data: { id, nama, satuan, batasMin: parseInt(batasMin) }
    });
    res.status(201).json(newBarang);
}));

// Route yang lebih spesifik harus diletakkan SEBELUM route yang lebih umum
app.get('/api/barang/:id/barcodes', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.query; // Opsional: ?status=available

    // 1. Cek dulu apakah barangnya ada
    const barang = await prisma.barang.findUnique({
        where: { id }
    });

    if (!barang) {
        return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    // 2. Siapkan kondisi pencarian
    const whereCondition = {
        barangId: id
    };

    // 3. Jika ada query parameter status
    if (status) {
        whereCondition.status = status;
    }

    // 4. Cari semua barcode yang cocok
    const barcodes = await prisma.itemBarcode.findMany({
        where: whereCondition,
        include: {
            // Sertakan PO dan Pemasok untuk info "asal barang"
            purchaseOrder: {
                select: {
                    id: true,
                    pemasok: {
                        select: {
                            nama: true
                        }
                    }
                }
            }
        },
        // BARIS YANG MENYEBABKAN ERROR SUDAH DIHAPUS DARI SINI
        // orderBy: { createdAt: 'desc' } <-- DIHAPUS
    });

    res.json(barcodes);
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

app.delete('/api/barang/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Cek apakah barang ada
        const barang = await prisma.barang.findUnique({
            where: { id },
            include: {
                items: true,
                poItems: true
            }
        });

        if (!barang) {
            return res.status(404).json({ message: 'Barang tidak ditemukan' });
        }

        // 2. Cek apakah barang masih digunakan
        const itemCount = barang.items.length;
        const poItemCount = barang.poItems.length;

        if (itemCount > 0 || poItemCount > 0) {
            let detailMessage = [];
            if (itemCount > 0) {
                detailMessage.push(`${itemCount} item fisik`);
            }
            if (poItemCount > 0) {
                detailMessage.push(`${poItemCount} item di Purchase Order`);
            }
            
            return res.status(409).json({ 
                message: `Barang tidak dapat dihapus karena masih digunakan (${detailMessage.join(', ')})`,
                detail: {
                    itemCount,
                    poItemCount
                }
            });
        }

        // 3. Hapus barang jika tidak digunakan
        await prisma.barang.delete({
            where: { id }
        });

        res.json({ message: 'Barang berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting barang:', error);
        
        // Handle Prisma foreign key constraint error
        if (error.code === 'P2003') {
            return res.status(409).json({ 
                message: 'Barang tidak dapat dihapus karena masih digunakan dalam transaksi lain' 
            });
        }
        
        throw error;
    }
}));
    const { id } = req.params;
    const { status } = req.query; // Opsional: ?status=available

    // 1. Cek dulu apakah barangnya ada
    const barang = await prisma.barang.findUnique({
        where: { id }
    });

    if (!barang) {
        return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    // 2. Siapkan kondisi pencarian
    const whereCondition = {
        barangId: id
    };

    // 3. Jika ada query parameter status
    if (status) {
        whereCondition.status = status;
    }

    // 4. Cari semua barcode yang cocok
    const barcodes = await prisma.itemBarcode.findMany({
        where: whereCondition,
        include: {
            // Sertakan PO dan Pemasok untuk info "asal barang"
            purchaseOrder: {
                select: {
                    id: true,
                    pemasok: {
                        select: {
                            nama: true
                        }
                    }
                }
            }
        },
        // BARIS YANG MENYEBABKAN ERROR SUDAH DIHAPUS DARI SINI
        // orderBy: { createdAt: 'desc' } <-- DIHAPUS
    });

    res.json(barcodes);
}));

// ===================================
// API MASTER PEMASOK (Requirement #2)
// ===================================
app.get('/api/pemasok', asyncHandler(async (req, res) => {
    try {
        const pemasok = await prisma.pemasok.findMany();
        res.json(pemasok);
    } catch (error) {
        console.error('Error fetching pemasok:', error);
        res.json([]); // Return empty array on error
    }
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
    try {
        const tujuan = await prisma.tujuan.findMany();
        res.json(tujuan);
    } catch (error) {
        console.error('Error fetching tujuan:', error);
        res.json([]); // Return empty array on error
    }
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
    try {
        const pos = await prisma.purchaseOrder.findMany({
            include: { 
                pemasok: {
                    select: {
                        id: true,
                        nama: true,
                        kontak: true
                    }
                } 
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(pos);
    } catch (error) {
        console.error('Error fetching PO list:', error);
        // Jika error karena orderBy, coba tanpa orderBy
        try {
            const pos = await prisma.purchaseOrder.findMany({
                include: { 
                    pemasok: {
                        select: {
                            id: true,
                            nama: true,
                            kontak: true
                        }
                    } 
                }
            });
            res.json(pos);
        } catch (fallbackError) {
            console.error('Fallback query also failed:', fallbackError);
            // Jika masih error, kirim array kosong
            res.json([]);
        }
    }
}));

// Untuk `viewPODetail`
app.get('/api/po/:id', asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const po = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                pemasok: {
                    select: {
                        id: true,
                        nama: true,
                        kontak: true
                    }
                },
                items: {
                    include: {
                        barang: {
                            select: {
                                id: true,
                                nama: true,
                                satuan: true,
                                batasMin: true
                            }
                        },
                    }
                }
            }
        });
        if (!po) {
            return res.status(404).json({ message: 'PO tidak ditemukan' });
        }
        res.json(po);
    } catch (error) {
        console.error('Error fetching PO detail:', error);
        throw error; // Lempar ke error handler global
    }
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
    try {
        // 1. Ambil semua barang
        let allBarang = [];
        try {
            allBarang = await prisma.barang.findMany();
        } catch (error) {
            console.error('Error fetching barang for stok:', error);
            return res.json([]);
        }
        
        // 2. Ambil semua stok
        let allStok = [];
        try {
            allStok = await prisma.itemBarcode.groupBy({
                by: ['barangId'],
                where: { status: 'available' },
                _count: { barcode: true }
            });
        } catch (error) {
            console.warn('Error grouping stok:', error);
            // Lanjutkan dengan array kosong
            allStok = [];
        }

        // 3. Gabungkan
        const stokMap = new Map(
            allStok.map(item => [item.barangId, item._count.barcode])
        );

        const stokList = allBarang.map(barang => ({
            ...barang,
            stok: stokMap.get(barang.id) || 0
        }));

        res.json(stokList);
    } catch (error) {
        console.error('Error in /api/stok:', error);
        res.json([]); // Return empty array on error
    }
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
// 404 Handler - Route tidak ditemukan
// ===================================
// Handler ini HARUS ditempatkan SETELAH semua route, tapi SEBELUM error handler
app.use((req, res) => {
    res.status(404).json({ 
        message: `Endpoint tidak ditemukan: ${req.method} ${req.path}`,
        path: req.path,
        method: req.method
    });
});

// ===================================
// Error Handler
// ===================================
app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Error stack:', err.stack);
    console.error('Request path:', req.path);
    console.error('Request method:', req.method);
    
    // Handle error Prisma
    if (err.code === 'P2002') { // Unique constraint violation
        const target = err.meta?.target;
        return res.status(409).json({ message: `Data duplikat: ${target}` });
    }
    if (err.code === 'P2025') { // Record not found
        return res.status(404).json({ message: 'Data tidak ditemukan' });
    }
    
    // Handle database connection errors
    if (err.code === 'P1001' || err.message?.includes('Can\'t reach database server') || err.message?.includes('connect ECONNREFUSED')) {
        return res.status(503).json({ 
            message: 'Database tidak dapat diakses. Pastikan database berjalan dan DATABASE_URL benar.',
            error: 'Database connection error',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
    
    // Handle Prisma client initialization errors
    if (err.message?.includes('PrismaClient') || err.message?.includes('Prisma')) {
        return res.status(500).json({ 
            message: 'Kesalahan koneksi database. Pastikan DATABASE_URL sudah dikonfigurasi dengan benar.',
            error: 'Database initialization error',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
    
    // Handle Prisma query errors
    if (err.code?.startsWith('P')) {
        return res.status(500).json({ 
            message: 'Kesalahan query database',
            error: err.code,
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
    
    res.status(500).json({ 
        message: 'Terjadi kesalahan di server', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});


// ===================================
// Start Server
// ===================================
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`🚀 Server sekarang berjalan di http://${HOST}:${PORT}`);
});