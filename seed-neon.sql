-- SQL Script untuk seed data ke Neon Database
-- Jalankan di Neon SQL Editor jika tidak bisa via Node.js

-- 1. Master Pemasok
INSERT INTO "Pemasok" (id, nama, kontak, "createdAt", "updatedAt")
VALUES 
    ('P001', 'PT Sumber Makmur Jaya', '081234567890', NOW(), NOW()),
    ('P002', 'CV Barokah Sejahtera', '081234567891', NOW(), NOW()),
    ('P003', 'UD Mandiri Abadi', '081234567892', NOW(), NOW()),
    ('P004', 'PT Global Supply Chain', '081234567893', NOW(), NOW()),
    ('P005', 'CV Mitra Bersama', '081234567894', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    kontak = EXCLUDED.kontak,
    "updatedAt" = NOW();

-- 2. Master Tujuan
INSERT INTO "Tujuan" (id, nama, tipe, "createdAt", "updatedAt")
VALUES 
    ('T001', 'Produksi Line A', 'Internal', NOW(), NOW()),
    ('T002', 'Produksi Line B', 'Internal', NOW(), NOW()),
    ('T003', 'Gudang Distribusi', 'Internal', NOW(), NOW()),
    ('T004', 'Customer Jakarta', 'Eksternal', NOW(), NOW()),
    ('T005', 'Customer Bandung', 'Eksternal', NOW(), NOW()),
    ('T006', 'Customer Surabaya', 'Eksternal', NOW(), NOW()),
    ('T007', 'Retur ke Supplier', 'Eksternal', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    tipe = EXCLUDED.tipe,
    "updatedAt" = NOW();

-- 3. Master Barang
INSERT INTO "Barang" (id, nama, satuan, "batasMin", "createdAt", "updatedAt")
VALUES 
    -- Elektronik
    ('B001', 'Laptop Dell Inspiron 15', 'unit', 5, NOW(), NOW()),
    ('B002', 'Mouse Wireless Logitech', 'unit', 20, NOW(), NOW()),
    ('B003', 'Keyboard Mechanical', 'unit', 15, NOW(), NOW()),
    ('B004', 'Monitor LED 24 inch', 'unit', 10, NOW(), NOW()),
    ('B005', 'Webcam HD 1080p', 'unit', 12, NOW(), NOW()),
    
    -- Perkakas
    ('B006', 'Obeng Set 10 pcs', 'set', 8, NOW(), NOW()),
    ('B007', 'Tang Kombinasi', 'unit', 15, NOW(), NOW()),
    ('B008', 'Palu Besi', 'unit', 10, NOW(), NOW()),
    ('B009', 'Bor Listrik', 'unit', 5, NOW(), NOW()),
    ('B010', 'Gergaji Besi', 'unit', 8, NOW(), NOW()),
    
    -- Bahan Baku
    ('B011', 'Kawat Tembaga 2.5mm', 'roll', 20, NOW(), NOW()),
    ('B012', 'Pipa PVC 1/2 inch', 'batang', 30, NOW(), NOW()),
    ('B013', 'Sekrup Baja 3x20mm', 'box', 25, NOW(), NOW()),
    ('B014', 'Cat Tembok Putih', 'kaleng', 15, NOW(), NOW()),
    ('B015', 'Lem Epoxy', 'tube', 20, NOW(), NOW()),
    
    -- Safety Equipment
    ('B016', 'Helm Safety', 'unit', 30, NOW(), NOW()),
    ('B017', 'Sarung Tangan Karet', 'pasang', 50, NOW(), NOW()),
    ('B018', 'Masker N95', 'box', 40, NOW(), NOW()),
    ('B019', 'Sepatu Safety', 'pasang', 20, NOW(), NOW()),
    ('B020', 'Kacamata Safety', 'unit', 25, NOW(), NOW()),
    
    -- Office Supplies
    ('B021', 'Kertas A4 80gsm', 'rim', 30, NOW(), NOW()),
    ('B022', 'Pulpen Hitam', 'box', 40, NOW(), NOW()),
    ('B023', 'Stapler Besar', 'unit', 10, NOW(), NOW()),
    ('B024', 'Isi Stapler No.10', 'box', 20, NOW(), NOW()),
    ('B025', 'Map Folder', 'pack', 25, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    satuan = EXCLUDED.satuan,
    "batasMin" = EXCLUDED."batasMin",
    "updatedAt" = NOW();

-- Verifikasi
SELECT 'Pemasok' as tabel, COUNT(*) as jumlah FROM "Pemasok"
UNION ALL
SELECT 'Tujuan', COUNT(*) FROM "Tujuan"
UNION ALL
SELECT 'Barang', COUNT(*) FROM "Barang";

