# 🚂 Panduan Deploy Backend ke Railway

## 📋 Prasyarat

1. ✅ Akun Railway (gratis di [railway.app](https://railway.app))
2. ✅ Repository GitHub sudah dibuat
3. ✅ Kode backend sudah di-push ke GitHub
4. ✅ Node.js version 18+ (Railway otomatis detect)

## 🚀 Langkah-langkah Deploy

### 1. Push Kode ke GitHub

Pastikan semua file sudah di-push ke GitHub:

```bash
cd "D:\ZUAM\WMS SC\gudangkuBE"
git add .
git commit -m "Setup untuk Railway deployment"
git push origin main
```

**Pastikan file `.env` TIDAK di-commit** (sudah ada di `.gitignore`)

### 2. Buat Project di Railway

1. Login ke [railway.app](https://railway.app)
2. Klik **"New Project"**
3. Pilih **"Deploy from GitHub repo"**
4. Pilih repository yang berisi backend (`gudangkuBE`)
5. Railway akan otomatis detect dan setup project

### 3. Setup PostgreSQL Database

1. Di dashboard Railway project, klik **"+ New"**
2. Pilih **"Database"** → **"Add PostgreSQL"**
3. Railway akan membuat PostgreSQL database baru
4. **Catat DATABASE_URL** yang diberikan Railway

### 4. Konfigurasi Environment Variables

1. Di dashboard project, klik tab **"Variables"**
2. Tambahkan environment variables berikut:

#### Required Variables:

```env
DATABASE_URL=<DATABASE_URL_DARI_RAILWAY_POSTGRESQL>
PORT=3000
NODE_ENV=production
```

**Cara mendapatkan DATABASE_URL:**
- Klik pada PostgreSQL service di Railway
- Tab **"Variables"** → Copy value dari `DATABASE_URL`
- Paste ke environment variables project backend

#### Optional Variables:

```env
# Jika ingin custom port (default Railway auto-assign)
PORT=3000

# Environment
NODE_ENV=production
```

### 5. Konfigurasi Build & Deploy Settings

Railway akan otomatis detect dari `package.json` dan `nixpacks.toml`:

**Build Process (Otomatis):**
1. Install dependencies: `npm ci`
2. Generate Prisma Client: `npx prisma generate`
3. Run migrations: `npx prisma migrate deploy` (dari build script)

**Start Command:**
- `npm start` (dari package.json)

**File Konfigurasi:**
- `nixpacks.toml` - Konfigurasi build process (sudah dibuat)
- `railway.json` - Konfigurasi Railway (opsional, sudah dibuat)

### 6. Setup Custom Domain (Opsional)

1. Di dashboard project, klik **"Settings"**
2. Tab **"Networking"**
3. Klik **"Generate Domain"** untuk mendapatkan URL Railway
4. Atau tambahkan custom domain jika punya

### 7. Deploy & Migrasi Database

Setelah environment variables di-set:

1. Railway akan otomatis deploy saat push ke GitHub
2. Atau klik **"Deploy"** manual di dashboard
3. **Migrasi database akan otomatis jalan** karena ada di `build` command:
   ```json
   "build": "npx prisma migrate deploy"
   ```

### 8. Verifikasi Deploy

1. Tunggu deploy selesai (lihat logs)
2. Klik **"View Logs"** untuk melihat proses
3. Pastikan tidak ada error
4. Buka URL yang diberikan Railway
5. Seharusnya muncul: `{"message":"Backend Gudangku is alive!","status":"running",...}`

## 📝 File Konfigurasi

### railway.json (Opsional)

File `railway.json` sudah dibuat untuk konfigurasi custom:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate"
  },
  "deploy": {
    "startCommand": "npm run build && npm start"
  }
}
```

Railway akan otomatis menggunakan konfigurasi ini jika ada.

## 🔧 Troubleshooting

### Error: "Prisma Client not generated"

**Solusi:**
- Pastikan `npx prisma generate` ada di build command
- Atau tambahkan di `railway.json`:
  ```json
  "buildCommand": "npm install && npx prisma generate"
  ```

### Error: "Database connection failed"

**Solusi:**
1. Pastikan `DATABASE_URL` sudah di-set di Railway Variables
2. Pastikan PostgreSQL service sudah running di Railway
3. Cek format DATABASE_URL (harus lengkap dengan credentials)

### Error: "Migration failed"

**Solusi:**
1. Pastikan `npm run build` (yang menjalankan `prisma migrate deploy`) ada di start command
2. Atau jalankan manual via Railway CLI:
   ```bash
   railway run npx prisma migrate deploy
   ```

### Error: "Port already in use"

**Solusi:**
- Railway otomatis assign PORT via environment variable
- Pastikan kode menggunakan `process.env.PORT`:
  ```javascript
  const PORT = process.env.PORT || 3000;
  ```
  (Sudah ada di `index.js`)

### Deploy tidak otomatis dari GitHub

**Solusi:**
1. Cek GitHub integration di Railway Settings
2. Pastikan repository sudah terhubung
3. Cek branch yang di-deploy (default: `main` atau `master`)

## 📊 Monitoring & Logs

### View Logs

1. Di dashboard Railway, klik project
2. Tab **"Deployments"** → Pilih deployment terbaru
3. Klik **"View Logs"** untuk melihat real-time logs

### Metrics

Railway menyediakan:
- CPU Usage
- Memory Usage
- Network Traffic
- Request Count

## 🔄 Update Deployment

Setelah setup pertama, setiap push ke GitHub akan otomatis trigger deploy:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Railway akan:
1. Detect perubahan
2. Build ulang
3. Deploy versi baru
4. Restart service

## 🗄️ Database Management

### Backup Database

1. Di PostgreSQL service, klik **"Data"** tab
2. Download backup via Railway dashboard
3. Atau gunakan Railway CLI:
   ```bash
   railway connect postgres
   pg_dump > backup.sql
   ```

### Reset Database (Hati-hati!)

```bash
railway run npx prisma migrate reset
```

### Seed Data Demo

```bash
railway run npm run seed
```

## 🔐 Security Best Practices

1. ✅ **Jangan commit `.env`** - Sudah di `.gitignore`
2. ✅ **Gunakan Railway Variables** - Jangan hardcode credentials
3. ✅ **Enable HTTPS** - Railway otomatis provide SSL
4. ✅ **Monitor Logs** - Cek secara berkala untuk suspicious activity

## 📱 Update Frontend API URL

Setelah backend ter-deploy, update frontend:

**File:** `gudangkuFE/src/services/api.js`

```javascript
// Ganti dengan URL Railway Anda
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-app.railway.app/api';
```

Atau set environment variable di frontend:
```env
VITE_API_BASE_URL=https://your-app.railway.app/api
```

## ✅ Checklist Deploy

- [ ] Kode sudah di-push ke GitHub
- [ ] Railway project sudah dibuat
- [ ] PostgreSQL database sudah dibuat di Railway
- [ ] Environment variables sudah di-set (DATABASE_URL, PORT, NODE_ENV)
- [ ] Build command sudah benar (include Prisma generate)
- [ ] Start command sudah benar (include migrate deploy)
- [ ] Deploy berhasil tanpa error
- [ ] API endpoint bisa diakses
- [ ] Database migration berhasil
- [ ] Frontend sudah di-update dengan URL Railway

## 💰 Railway Pricing

**Free Tier:**
- $5 credit gratis per bulan
- Cukup untuk development/small production
- Auto-sleep setelah idle (bisa di-disable)

**Pro Tier:**
- $20/bulan
- No sleep
- More resources
- Better support

## 🚀 Quick Deploy Commands

```bash
# 1. Push ke GitHub
git add .
git commit -m "Deploy to Railway"
git push origin main

# 2. Setup di Railway Dashboard (manual)
# - Create project
# - Add PostgreSQL
# - Set environment variables
# - Deploy

# 3. Verifikasi
curl https://your-app.railway.app
```

## 📚 Referensi

- [Railway Documentation](https://docs.railway.app)
- [Railway PostgreSQL Guide](https://docs.railway.app/databases/postgresql)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

