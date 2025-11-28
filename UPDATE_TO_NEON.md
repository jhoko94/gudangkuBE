# 🔄 Update Database ke Neon

## ✅ Status Saat Ini

- ❌ DATABASE_URL masih mengarah ke **Local PostgreSQL** (`localhost:5432`)
- ✅ Tabel sudah ada di Neon (migrate berhasil)
- ⚠️  Data master belum ada di Neon (perlu seed)

## 🚀 Langkah-langkah

### 1. Update DATABASE_URL di .env

Buka file `.env` di folder `gudangkuBE` dan update `DATABASE_URL`:

**Dari:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=gudang_db"
```

**Ke (format Neon):**
```env
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require"
```

**Contoh Neon connection string:**
```env
DATABASE_URL="postgresql://neondb_owner:password123@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**Cara mendapatkan connection string dari Neon:**
1. Buka Neon Dashboard
2. Pilih project dan database Anda
3. Klik **"Connection Details"** atau **"Connection String"**
4. Copy connection string
5. Pastikan ada `?sslmode=require` di akhir

### 2. Verifikasi Koneksi

Setelah update `.env`, verifikasi koneksi:

```bash
cd "D:\ZUAM\WMS SC\gudangkuBE"
npm run check-db
```

**Output yang diharapkan:**
```
📍 Database: Neon ✅
✅ Connected successfully!
✅ Found X tables
   - Pemasok: 0 records  ← Harusnya 0 karena belum di-seed
   - Tujuan: 0 records
   - Barang: 0 records
```

### 3. Jalankan Seed ke Neon

Setelah koneksi ke Neon berhasil, jalankan seed:

```bash
npm run seed:safe
```

**Output yang diharapkan:**
```
🌱 Database kosong, mulai seeding master data demo...
📦 Menambahkan Master Pemasok...
  ✅ P001 - PT Sumber Makmur Jaya
  ...
✅ Seeding master data selesai!
```

### 4. Verifikasi Data

Cek lagi apakah data sudah masuk:

```bash
npm run check-db
```

**Output yang diharapkan:**
```
   - Pemasok: 5 records  ✅
   - Tujuan: 7 records    ✅
   - Barang: 25 records   ✅
```

Atau cek langsung di Neon Dashboard:
1. Buka Neon Dashboard
2. Pilih database
3. Buka **"Table Editor"**
4. Cek tabel `Pemasok`, `Tujuan`, `Barang`

## 🔍 Troubleshooting

### Error: "Can't reach database server"

**Kemungkinan:**
- Connection string salah
- Database belum dibuat di Neon
- Network/firewall issue

**Solusi:**
1. Double-check connection string dari Neon Dashboard
2. Pastikan format: `postgresql://...?sslmode=require`
3. Coba test connection di Neon Dashboard dulu

### Error: "SSL connection required"

**Solusi:**
- Pastikan connection string ada `?sslmode=require` di akhir
- Atau tambahkan `&sslmode=require` jika sudah ada parameter lain

### Data tidak muncul setelah seed

**Solusi:**
1. Cek logs saat seed berjalan (apakah ada error?)
2. Verifikasi dengan `npm run check-db`
3. Cek di Neon Dashboard langsung
4. Jika masih kosong, coba jalankan seed lagi (aman karena pakai upsert)

## ✅ Checklist

- [ ] DATABASE_URL sudah di-update ke Neon
- [ ] `npm run check-db` menunjukkan "Database: Neon ✅"
- [ ] Seed berhasil dijalankan
- [ ] Data muncul di Neon Dashboard
- [ ] API endpoint bisa return data

## 📝 Catatan

- **Local database** masih ada datanya (5 pemasok, 7 tujuan, 25 barang)
- **Neon database** perlu di-seed karena masih kosong
- Setelah update `.env` ke Neon, semua operasi (dev, seed, migrate) akan menggunakan Neon
- Jika ingin kembali ke local, cukup update `.env` lagi

