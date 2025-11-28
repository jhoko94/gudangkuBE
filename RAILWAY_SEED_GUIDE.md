# 🌱 Panduan Seed Data di Railway

## 📋 Quick Start

### Cara 1: Via Railway CLI (Paling Mudah)

```bash
# 1. Install Railway CLI (jika belum)
npm i -g @railway/cli

# 2. Login
railway login

# 3. Link ke project
cd "D:\ZUAM\WMS SC\gudangkuBE"
railway link

# 4. Jalankan seed
railway run npm run seed
```

### Cara 2: Via Railway Dashboard

1. Buka Railway dashboard → Project Anda
2. Klik tab **"Deployments"**
3. Klik **"..."** pada deployment terbaru
4. Pilih **"Run Command"**
5. Masukkan: `npm run seed`
6. Klik **"Run"**

## ✅ Status Konfigurasi

### Migrate - ✅ SUDAH OTOMATIS

**Konfigurasi:**
- ✅ `nixpacks.toml` - Build phase: `npx prisma migrate deploy`
- ✅ `package.json` - Build script: `"build": "npx prisma migrate deploy"`

**Cara Kerja:**
- Setiap deploy, Railway otomatis menjalankan migrate
- Tidak perlu setup tambahan

### Prisma Generate - ✅ SUDAH OTOMATIS

**Konfigurasi:**
- ✅ `nixpacks.toml` - Install phase: `npx prisma generate`

**Cara Kerja:**
- Setiap build, Railway otomatis generate Prisma Client
- Tidak perlu setup tambahan

### Seed - ⚠️ MANUAL (Perlu Dijalankan Manual)

**Konfigurasi:**
- ✅ `package.json` - Script: `"seed": "node seed-demo.js"`
- ✅ `seed-demo.js` - Script seed sudah ada

**Cara Kerja:**
- Seed **TIDAK** otomatis di production
- Harus dijalankan manual setelah deploy pertama
- Aman dijalankan berulang (menggunakan `upsert`)

## 🎯 Kapan Perlu Seed?

### Deploy Pertama (Setelah Migrate)

Setelah deploy pertama dan migrate berhasil, jalankan seed untuk menambahkan:
- 5 Master Pemasok
- 7 Master Tujuan  
- 25 Master Barang

### Update Data Demo

Jika ingin update atau reset data demo, jalankan seed lagi (aman karena upsert).

## 📝 Checklist

### Sebelum Deploy:
- [x] Migration files sudah ter-commit (✅ Sudah dicek)
- [x] `seed-demo.js` sudah ter-commit
- [x] `nixpacks.toml` sudah dikonfigurasi
- [x] `package.json` memiliki script `seed`

### Setelah Deploy:
- [ ] Deploy berhasil
- [ ] Migrate berhasil (cek logs)
- [ ] Jalankan seed manual (satu kali)
- [ ] Verifikasi data muncul di API

## 🔍 Verifikasi

Setelah seed, test API:

```bash
# Test endpoint barang
curl https://your-app.railway.app/api/barang

# Test endpoint pemasok
curl https://your-app.railway.app/api/pemasok

# Test endpoint tujuan
curl https://your-app.railway.app/api/tujuan
```

Seharusnya mengembalikan data yang sudah di-seed.

