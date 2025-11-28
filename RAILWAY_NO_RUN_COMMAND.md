# 🔧 Jalankan Migrate di Railway (Tanpa Run Command)

## 🎯 Solusi: Update Start Command

Karena "Run Command" tidak tersedia, kita akan update **Start Command** di Railway Settings agar migrate otomatis berjalan setiap start.

## 🚀 Langkah-langkah

### 1. Update Start Command di Railway

1. **Buka Railway Dashboard**
   - Pilih project → Service `gudangkuBE`
   - Klik tab **"Settings"**

2. **Scroll ke bagian "Deploy"**
   - Cari **"Custom Start Command"**
   - Klik **"+ Start Command"** (atau edit yang sudah ada)

3. **Masukkan Start Command:**

   **Opsi 1 (Recommended - dengan seed):**
   ```
   npm run start:production
   ```

   **Opsi 2 (Simple - hanya migrate):**
   ```
   npm run start:simple
   ```

   **Opsi 3 (Langsung - tanpa script):**
   ```
   npx prisma migrate deploy && npm start
   ```

4. **Save Settings**
   - Railway akan otomatis redeploy dengan start command baru

### 2. Tunggu Redeploy

- Railway akan otomatis redeploy setelah save
- Atau klik **"Redeploy"** manual di tab "Deployments"

### 3. Cek Logs

1. Tab **"Deployments"**
2. Klik deployment terbaru
3. Klik **"View Logs"**
4. Seharusnya melihat:
   - `🔄 Running database migrations...`
   - `✅ Migrations completed`
   - `🚀 Starting Express server...`

### 4. Verifikasi Database

1. Buka PostgreSQL service
2. Tab **"Database"** → **"Data"**
3. Tabel seharusnya sudah muncul

## 📝 Start Command yang Tersedia

### 1. `npm run start:production` (Recommended)
- ✅ Migrate otomatis
- ✅ Seed otomatis (jika database kosong)
- ✅ Logging lengkap
- ✅ Error handling baik

### 2. `npm run start:simple`
- ✅ Migrate otomatis
- ❌ Tidak ada seed
- ✅ Lebih simple

### 3. `npx prisma migrate deploy && npm start`
- ✅ Migrate otomatis
- ❌ Tidak ada seed
- ✅ Paling simple (langsung)

## 🔍 Verifikasi

### Cek Logs:
```
🔄 Running database migrations...
DATABASE_URL: Set ✅
Prisma schema loaded from prisma/schema.prisma
Applying migration `20251105064523_first_migrate`
Applying migration `20251107070147_tambah_relasi_barang_pemasok`
Applying migration `20251107072004_revert_relasi_barang_pemasok`
✅ Migrations completed successfully
🚀 Starting Express server...
```

### Cek Database:
- Buka PostgreSQL → Database → Data
- Seharusnya melihat 7 tabel

## 🐛 Troubleshooting

### Error: "DATABASE_URL not set"

**Solusi:**
1. Buka Railway → Project → Variables
2. Pastikan `DATABASE_URL` sudah di-set
3. Copy dari PostgreSQL service Variables

### Error: "No migrations found"

**Solusi:**
1. Pastikan folder `prisma/migrations/` ter-commit ke GitHub
2. Cek di GitHub apakah folder migrations ada
3. Jika tidak, commit:
   ```bash
   git add prisma/migrations/
   git commit -m "Add migrations"
   git push origin main
   ```

### Migrate masih tidak jalan

**Solusi:**
1. Pastikan start command sudah di-save
2. Pastikan redeploy sudah dilakukan
3. Cek logs untuk melihat error detail
4. Pastikan DATABASE_URL benar

## ✅ Checklist

- [ ] Start command sudah di-update di Railway Settings
- [ ] Start command: `npm run start:production` (atau opsi lain)
- [ ] Save settings
- [ ] Redeploy sudah dilakukan
- [ ] Cek logs untuk melihat migrate berjalan
- [ ] Verifikasi tabel muncul di database
- [ ] (Opsional) Jalankan seed setelah migrate

## 🎯 Rekomendasi

**Gunakan:**
```
npm run start:production
```

**Alasan:**
- ✅ Migrate otomatis
- ✅ Seed otomatis jika database kosong
- ✅ Error handling lengkap
- ✅ Logging jelas

## 💡 Tips

1. **Setelah update start command**, Railway akan auto-redeploy
2. **Cek logs** untuk memastikan migrate berjalan
3. **Jika masih error**, cek DATABASE_URL di Variables
4. **Seed akan otomatis** jika database kosong (dengan start:production)

