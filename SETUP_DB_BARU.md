# Setup Database Baru di pgAdmin Lokal

## 📋 Langkah-langkah Setup

### 1. Buat Database di pgAdmin

1. Buka pgAdmin
2. Klik kanan pada **Databases** → **Create** → **Database**
3. Isi:
   - **Database name**: `gudang_db` (atau nama lain sesuai keinginan)
   - **Owner**: `postgres` (atau user PostgreSQL Anda)
4. Klik **Save**

### 2. Konfigurasi .env

Edit file `.env` di folder `gudangkuBE` dengan format:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/NAMA_DATABASE"
```

**Contoh:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gudang_db"
```

**Penjelasan:**
- `postgres` = username PostgreSQL
- `postgres` = password PostgreSQL
- `localhost:5432` = host dan port (default PostgreSQL)
- `gudang_db` = nama database yang dibuat di pgAdmin

### 3. Generate Prisma Client

```bash
cd "D:\ZUAM\WMS SC\gudangkuBE"
npm run db:generate
```

Atau:
```bash
npx prisma generate
```

### 4. Test Koneksi Database

```bash
npm run setup-db
```

Script ini akan:
- ✅ Menguji koneksi ke database
- ✅ Memeriksa apakah tabel sudah ada
- ✅ Memberikan instruksi langkah selanjutnya

### 5. Jalankan Migrasi Database

Jika koneksi berhasil dan tabel belum ada:

```bash
npm run db:migrate
```

Atau:
```bash
npx prisma migrate dev
```

Ini akan:
- Membuat semua tabel di database
- Menjalankan semua migration yang ada

### 6. Tambahkan Master Data Demo (Opsional)

```bash
npm run seed
```

Ini akan menambahkan:
- 5 Master Pemasok
- 7 Master Tujuan
- 25 Master Barang

### 7. Jalankan Backend Server

```bash
npm run dev
```

## 🔍 Troubleshooting

### Error: "Can't reach database server"

**Solusi:**
1. Pastikan PostgreSQL service berjalan
2. Cek apakah port 5432 tidak digunakan aplikasi lain
3. Verifikasi username dan password di `.env`

### Error: "Database does not exist"

**Solusi:**
1. Pastikan database sudah dibuat di pgAdmin
2. Cek nama database di `.env` sesuai dengan yang dibuat
3. Pastikan user memiliki akses ke database tersebut

### Error: "relation does not exist"

**Solusi:**
1. Jalankan migrasi: `npm run db:migrate`
2. Pastikan migrasi berjalan tanpa error

### Error: "password authentication failed"

**Solusi:**
1. Cek password PostgreSQL di `.env`
2. Jika lupa password, reset di pgAdmin atau PostgreSQL config

## ✅ Checklist Setup

- [ ] Database sudah dibuat di pgAdmin
- [ ] File `.env` sudah dikonfigurasi dengan benar
- [ ] Prisma Client sudah di-generate (`npm run db:generate`)
- [ ] Koneksi database berhasil (`npm run setup-db`)
- [ ] Migrasi database sudah dijalankan (`npm run db:migrate`)
- [ ] Master data demo sudah ditambahkan (`npm run seed`) - opsional
- [ ] Backend server bisa berjalan (`npm run dev`)

## 📝 Format DATABASE_URL

**Format Umum:**
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

**Contoh untuk PostgreSQL Lokal:**
```
postgresql://postgres:postgres@localhost:5432/gudang_db
```

**Contoh untuk PostgreSQL dengan Port Custom:**
```
postgresql://postgres:postgres@localhost:5433/gudang_db
```

## 💡 Tips

1. **Backup Database**: Sebelum reset, backup database jika ada data penting
2. **Environment Variables**: Jangan commit file `.env` ke git
3. **Multiple Databases**: Bisa membuat beberapa database untuk development dan production
4. **Port PostgreSQL**: Default port adalah 5432, tapi bisa berbeda

## 🚀 Quick Start

Setelah database dibuat dan `.env` dikonfigurasi:

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Test koneksi
npm run setup-db

# 3. Migrasi database
npm run db:migrate

# 4. Seed data demo (opsional)
npm run seed

# 5. Jalankan server
npm run dev
```

