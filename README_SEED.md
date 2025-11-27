# Panduan Seeding Master Data Demo

## 📋 Deskripsi

Script `seed-demo.js` digunakan untuk menambahkan master data sample ke database untuk keperluan demo aplikasi.

## 🚀 Cara Menggunakan

### 1. Pastikan Database Sudah Siap

```bash
# Pastikan .env sudah dikonfigurasi dengan DATABASE_URL
# Pastikan migrasi database sudah dijalankan
npx prisma migrate dev
```

### 2. Jalankan Script Seeding

```bash
npm run seed
```

Atau langsung:

```bash
node seed-demo.js
```

## 📦 Data yang Akan Ditambahkan

### Master Pemasok (5 data)
- P001: PT Sumber Makmur Jaya
- P002: CV Barokah Sejahtera
- P003: UD Mandiri Abadi
- P004: PT Global Supply Chain
- P005: CV Mitra Bersama

### Master Tujuan (7 data)
**Internal:**
- T001: Produksi Line A
- T002: Produksi Line B
- T003: Gudang Distribusi

**Eksternal:**
- T004: Customer Jakarta
- T005: Customer Bandung
- T006: Customer Surabaya
- T007: Retur ke Supplier

### Master Barang (25 data)
Dibagi dalam beberapa kategori:

**Elektronik (5 barang):**
- B001: Laptop Dell Inspiron 15
- B002: Mouse Wireless Logitech
- B003: Keyboard Mechanical
- B004: Monitor LED 24 inch
- B005: Webcam HD 1080p

**Perkakas (5 barang):**
- B006: Obeng Set 10 pcs
- B007: Tang Kombinasi
- B008: Palu Besi
- B009: Bor Listrik
- B010: Gergaji Besi

**Bahan Baku (5 barang):**
- B011: Kawat Tembaga 2.5mm
- B012: Pipa PVC 1/2 inch
- B013: Sekrup Baja 3x20mm
- B014: Cat Tembok Putih
- B015: Lem Epoxy

**Safety Equipment (5 barang):**
- B016: Helm Safety
- B017: Sarung Tangan Karet
- B018: Masker N95
- B019: Sepatu Safety
- B020: Kacamata Safety

**Office Supplies (5 barang):**
- B021: Kertas A4 80gsm
- B022: Pulpen Hitam
- B023: Stapler Besar
- B024: Isi Stapler No.10
- B025: Map Folder

## ⚙️ Fitur

- **Upsert**: Script menggunakan `upsert` sehingga aman dijalankan berulang kali
- **Error Handling**: Setiap data yang gagal akan ditampilkan dengan pesan error
- **Progress Indicator**: Menampilkan progress untuk setiap data yang ditambahkan

## 🔄 Reset Data

Jika ingin menghapus semua data dan mulai dari awal:

```bash
# Hapus semua data (HATI-HATI!)
npx prisma migrate reset

# Jalankan migrasi ulang
npx prisma migrate dev

# Seed data demo
npm run seed
```

## 💡 Tips

1. **Batas Minimum**: Beberapa barang memiliki batas minimum rendah untuk memudahkan demo fitur "Stok Kritis"
2. **Data Realistis**: Semua data menggunakan nama dan format yang realistis
3. **Konsistensi**: ID menggunakan format konsisten (P001, T001, B001, dll)

## ⚠️ Catatan

- Script ini **TIDAK** akan menghapus data yang sudah ada
- Jika ID sudah ada, data akan di-update
- Pastikan database connection sudah benar sebelum menjalankan script

