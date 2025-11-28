# 🔍 Debug: Database Masih Kosong

## 🔍 Langkah Debugging

### 1. Cek Logs di Railway

1. Buka Railway Dashboard
2. Service `gudangkuBE` → Tab **"Deployments"**
3. Klik deployment terbaru → **"View Logs"**
4. Cari pesan:
   - `🔄 Running database migrations...`
   - `✅ Migrations completed successfully`
   - Atau error message

### 2. Cek Apakah Migrate Berjalan

Di logs, seharusnya melihat:
```
🔄 Running database migrations...
DATABASE_URL: Set ✅
📦 Found X migration(s) to apply
🚀 Executing: npx prisma migrate deploy
```

Jika tidak melihat ini, berarti start command tidak dieksekusi dengan benar.

### 3. Cek Start Command

1. Railway Dashboard → Service `gudangkuBE` → **"Settings"**
2. Scroll ke **"Deploy"** → **"Custom Start Command"**
3. Pastikan isinya: `npm run start:production`
4. Jika kosong atau berbeda, update dan save

### 4. Cek Migration Files

Pastikan migration files ter-commit:

```bash
cd "D:\ZUAM\WMS SC\gudangkuBE"
git ls-files prisma/migrations/
```

Seharusnya melihat:
- `prisma/migrations/migration_lock.toml`
- `prisma/migrations/20251105064523_first_migrate/migration.sql`
- dll

### 5. Test Migrate Manual (Via Railway CLI)

Jika Railway CLI tersedia:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link
cd "D:\ZUAM\WMS SC\gudangkuBE"
railway link

# Cek migration status
railway run npx prisma migrate status

# Jalankan migrate
railway run npx prisma migrate deploy
```

## 🚨 Kemungkinan Masalah

### 1. Start Command Tidak Dieksekusi

**Gejala:** Logs tidak menunjukkan pesan migrate

**Solusi:**
- Pastikan start command sudah di-save
- Pastikan redeploy sudah dilakukan
- Cek apakah ada error di logs sebelum start

### 2. Migrate Gagal Silent

**Gejala:** Migrate berjalan tapi gagal tanpa error jelas

**Solusi:**
- Cek logs dengan detail
- Pastikan DATABASE_URL benar
- Pastikan PostgreSQL service running

### 3. Migration Files Tidak Ada

**Gejala:** Error "No migrations found"

**Solusi:**
```bash
git add prisma/migrations/
git commit -m "Add migrations"
git push origin main
```

### 4. DATABASE_URL Salah

**Gejala:** Error connection

**Solusi:**
1. Buka Railway → PostgreSQL service → Variables
2. Copy `DATABASE_URL`
3. Paste ke service `gudangkuBE` → Variables
4. Pastikan format benar

## ✅ Solusi Langsung

### Opsi 1: Update Start Command (Paling Mudah)

1. Railway Settings → Custom Start Command
2. Masukkan:
   ```
   npx prisma migrate deploy && npm start
   ```
3. Save dan redeploy

### Opsi 2: Pre-Deploy Step

1. Railway Settings → Deploy
2. Klik **"+ Add pre-deploy step"**
3. Masukkan:
   ```
   npx prisma migrate deploy
   ```
4. Start Command tetap: `npm start`

### Opsi 3: Force Migrate di Start

Update start command menjadi:
```
npx prisma migrate deploy --force && npm start
```

## 🔍 Verifikasi

Setelah update, cek logs harus melihat:

```
🔄 Running database migrations...
DATABASE_URL: Set ✅
📦 Found 3 migration(s) to apply
🚀 Executing: npx prisma migrate deploy
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "railway", schema "public"
Applying migration `20251105064523_first_migrate`
Applying migration `20251107070147_tambah_relasi_barang_pemasok`
Applying migration `20251107072004_revert_relasi_barang_pemasok`
All migrations have been successfully applied.
✅ Migrations completed successfully
🚀 Starting Express server...
```

## 📝 Checklist Debug

- [ ] Cek logs Railway untuk melihat apakah migrate berjalan
- [ ] Cek start command sudah benar: `npm run start:production`
- [ ] Cek DATABASE_URL sudah ter-set di Variables
- [ ] Cek migration files ter-commit ke GitHub
- [ ] Cek PostgreSQL service sudah running
- [ ] Cek apakah ada error di logs
- [ ] Test dengan start command langsung: `npx prisma migrate deploy && npm start`

