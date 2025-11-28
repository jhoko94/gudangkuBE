# 🚨 Jalankan Migrate Sekarang di Railway

## ⚡ Quick Fix - Jalankan Migrate Manual

Karena database masih kosong, jalankan migrate manual sekarang:

### Via Railway Dashboard (Paling Mudah):

1. **Buka Railway Dashboard**
   - Pilih project → Service `gudangkuBE`

2. **Jalankan Command**
   - Tab **"Deployments"**
   - Klik **"..."** pada deployment terbaru
   - Pilih **"Run Command"**
   - Masukkan:
     ```
     npx prisma migrate deploy
     ```
   - Klik **"Run"**

3. **Tunggu Selesai**
   - Lihat output di logs
   - Seharusnya melihat: `All migrations have been successfully applied`

4. **Verifikasi**
   - Buka PostgreSQL service
   - Tab **"Database"** → **"Data"**
   - Tabel seharusnya sudah muncul

### Via Railway CLI:

```bash
# 1. Install Railway CLI (jika belum)
npm i -g @railway/cli

# 2. Login
railway login

# 3. Link ke project
cd "D:\ZUAM\WMS SC\gudangkuBE"
railway link

# 4. Jalankan migrate
railway run npx prisma migrate deploy

# 5. (Opsional) Jalankan seed
railway run npm run seed:safe
```

## 🔧 Pastikan Start Command Sudah Benar

Setelah migrate manual berhasil, pastikan start command sudah di-set untuk deploy berikutnya:

1. **Buka Railway Settings**
   - Service `gudangkuBE` → Tab **"Settings"**

2. **Update Start Command**
   - Scroll ke **"Deploy"** → **"Custom Start Command"**
   - Masukkan:
     ```
     npm run start:production
     ```
   - **Save**

3. **Untuk Deploy Berikutnya**
   - Migrate akan otomatis berjalan saat start
   - Tidak perlu jalankan manual lagi

## 🔍 Troubleshooting

### Error: "No migrations found"

**Penyebab:** Folder `prisma/migrations/` tidak ter-commit

**Solusi:**
```bash
cd "D:\ZUAM\WMS SC\gudangkuBE"
git add prisma/migrations/
git commit -m "Add Prisma migrations"
git push origin main
```

### Error: "DATABASE_URL not set"

**Solusi:**
1. Buka Railway → Project → Variables
2. Pastikan `DATABASE_URL` sudah di-set
3. Copy dari PostgreSQL service Variables

### Error: "Can't reach database server"

**Solusi:**
1. Pastikan PostgreSQL service sudah running (green checkmark)
2. Pastikan DATABASE_URL benar
3. Cek connection string format

## ✅ Checklist

- [ ] Jalankan migrate manual via Railway Dashboard
- [ ] Verifikasi tabel muncul di database
- [ ] Update start command: `npm run start:production`
- [ ] (Opsional) Jalankan seed: `railway run npm run seed:safe`
- [ ] Test API endpoint untuk memastikan berfungsi

## 🎯 Langkah Selanjutnya

Setelah migrate berhasil:

1. **Jalankan Seed (Opsional)**
   ```
   railway run npm run seed:safe
   ```
   Atau via Dashboard: Run Command → `npm run seed:safe`

2. **Test API**
   ```bash
   curl https://your-app.railway.app/api/barang
   ```

3. **Update Frontend**
   - Update `VITE_API_BASE_URL` di frontend
   - Test koneksi frontend ke backend Railway

