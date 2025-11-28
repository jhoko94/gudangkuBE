# 🔧 Fix Healthcheck Failed di Railway

## ❌ Error yang Terjadi

```
Healthcheck failed!
1/1 replicas never became healthy!
```

**Build berhasil**, tapi aplikasi tidak bisa start atau tidak merespons healthcheck.

## 🔍 Penyebab

1. **Start command salah** - Menggunakan `npm start` yang langsung start server tanpa migrate
2. **Server tidak start dengan benar** - Mungkin ada error saat start yang tidak terlihat
3. **Port/Host configuration** - Server tidak listen di port yang benar

## ✅ Solusi yang Sudah Diterapkan

### 1. Update Start Command di nixpacks.toml

**Sebelum:**
```toml
[start]
cmd = "npm start"  # ❌ Langsung start tanpa migrate
```

**Sesudah:**
```toml
[start]
cmd = "npm run start:production"  # ✅ Include migrate & seed
```

### 2. Pastikan start-production.js Benar

Script `start-production.js` akan:
1. ✅ Run migrations (`npx prisma migrate deploy`)
2. ✅ Check & seed (jika database kosong)
3. ✅ Start server (`node index.js`)

### 3. Pastikan Server Listen di Port yang Benar

Di `index.js` sudah benar:
```javascript
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';  // ✅ Penting untuk Railway
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server sekarang berjalan di http://${HOST}:${PORT}`);
});
```

## 🚀 Langkah-langkah Fix

### 1. Update nixpacks.toml

File sudah di-update untuk menggunakan `npm run start:production`.

### 2. Commit & Push ke GitHub

```bash
cd "D:\ZUAM\WMS SC\gudangkuBE"
git add nixpacks.toml
git commit -m "Fix: Update start command untuk include migrate"
git push origin main
```

### 3. Tunggu Railway Auto-Deploy

Railway akan otomatis:
1. Detect perubahan
2. Build ulang
3. Deploy dengan start command baru

### 4. Cek Deploy Logs

Setelah deploy, cek logs untuk memastikan:
- ✅ Migrations berhasil
- ✅ Seed berhasil (jika perlu)
- ✅ Server start tanpa error
- ✅ Server listen di port yang benar

## 🔍 Verifikasi

### Cek di Railway Logs:

1. **Build Logs** - Pastikan build berhasil
2. **Deploy Logs** - Cek apakah ada error saat start
3. **HTTP Logs** - Cek apakah ada request yang masuk

### Expected Logs:

```
🚀 Starting production server...
==================================================
Current directory: /app
Node version: v18.x.x
DATABASE_URL: Set ✅
==================================================

📋 Step 1: Running migrations...
🔄 Running database migrations...
✅ Migrations completed successfully!

📋 Step 2: Checking and seeding (if needed)...
📊 Current data: Pemasok=5, Tujuan=7, Barang=25
✅ Data sudah ada, skip seeding

==================================================
📋 Step 3: Starting Express server...
==================================================
🚀 Server sekarang berjalan di http://0.0.0.0:3000
```

## 🐛 Troubleshooting

### Masih Healthcheck Failed?

1. **Cek Deploy Logs:**
   - Apakah ada error saat migrate?
   - Apakah ada error saat start server?
   - Apakah server benar-benar start?

2. **Cek Environment Variables:**
   - `DATABASE_URL` sudah di-set?
   - `PORT` sudah di-set? (Railway auto-assign, tapi bisa manual)

3. **Cek Healthcheck Path:**
   - Railway healthcheck ke `/` (root endpoint)
   - Pastikan endpoint `/` return 200 OK

4. **Cek Server Listen:**
   - Pastikan server listen di `0.0.0.0` (bukan `localhost`)
   - Pastikan PORT dari environment variable

### Error: "Cannot find module"

**Solusi:**
- Pastikan `npm install` berhasil di build phase
- Pastikan `npx prisma generate` berhasil

### Error: "Database connection failed"

**Solusi:**
- Pastikan `DATABASE_URL` sudah di-set di Railway Variables
- Pastikan database service sudah running
- Cek format DATABASE_URL (harus lengkap)

### Error: "Migration failed"

**Solusi:**
- Cek logs untuk detail error
- Pastikan migrations folder ada di repository
- Pastikan DATABASE_URL benar

## 📝 Checklist

- [x] Update `nixpacks.toml` start command
- [ ] Commit & push perubahan
- [ ] Tunggu Railway auto-deploy
- [ ] Cek deploy logs
- [ ] Verifikasi healthcheck berhasil
- [ ] Test API endpoint

## 🔄 Alternative: Manual Start Command di Railway

Jika auto-deploy tidak berhasil, set manual di Railway:

1. Railway Dashboard → Service `gudangkuBE`
2. Settings → **Start Command**
3. Set: `npm run start:production`
4. Save & Redeploy

## ✅ Expected Result

Setelah fix:
- ✅ Build berhasil
- ✅ Migrations berhasil
- ✅ Server start tanpa error
- ✅ Healthcheck berhasil
- ✅ API endpoint bisa diakses

