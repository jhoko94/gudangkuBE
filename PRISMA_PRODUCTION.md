# 🔄 Prisma Migrate & Seed di Production (Railway)

## 📋 Perbedaan Local vs Production

### Local (Development)
- **Migrate**: `npx prisma migrate dev` - Membuat migration baru + apply
- **Seed**: `npm run seed` - Menjalankan seed-demo.js
- **Generate**: `npx prisma generate` - Generate Prisma Client

### Production (Railway)
- **Migrate**: `npx prisma migrate deploy` - Hanya apply migration yang sudah ada
- **Seed**: Manual via Railway CLI atau one-time setup
- **Generate**: Otomatis di build process

## ✅ Konfigurasi yang Sudah Ada

### 1. Migrate - ✅ SUDAH OTOMATIS

**File:** `nixpacks.toml`
```toml
[phases.build]
cmds = [
  "npx prisma migrate deploy"
]
```

**File:** `package.json`
```json
{
  "scripts": {
    "build": "npx prisma migrate deploy"
  }
}
```

**Cara Kerja:**
- Setiap deploy, Railway akan otomatis menjalankan `npx prisma migrate deploy`
- Ini akan apply semua migration yang ada di folder `prisma/migrations/`
- **Pastikan folder `prisma/migrations/` ter-commit ke GitHub!**

### 2. Prisma Generate - ✅ SUDAH OTOMATIS

**File:** `nixpacks.toml`
```toml
[phases.install]
cmds = [
  "npm install",
  "npx prisma generate"
]
```

**Cara Kerja:**
- Setiap build, Railway akan generate Prisma Client
- Otomatis sebelum migrate dan start

### 3. Seed - ⚠️ MANUAL (Tidak Otomatis)

**File:** `package.json`
```json
{
  "scripts": {
    "seed": "node seed-demo.js"
  }
}
```

**Cara Kerja:**
- Seed **TIDAK** dijalankan otomatis di production
- Harus dijalankan manual via Railway CLI atau dashboard

## 🚀 Cara Menjalankan Seed di Railway

### Opsi 1: Via Railway CLI (Recommended)

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Link ke project:**
   ```bash
   cd "D:\ZUAM\WMS SC\gudangkuBE"
   railway link
   ```

4. **Jalankan seed:**
   ```bash
   railway run npm run seed
   ```

### Opsi 2: Via Railway Dashboard (One-time)

1. Buka Railway dashboard
2. Pilih project backend
3. Klik tab **"Deployments"**
4. Klik **"..."** pada deployment terbaru
5. Pilih **"Run Command"**
6. Masukkan: `npm run seed`
7. Klik **"Run"**

### Opsi 3: Tambahkan ke Build (Tidak Recommended)

Jika ingin seed otomatis setiap deploy (hati-hati, bisa duplikat data):

**File:** `nixpacks.toml`
```toml
[phases.build]
cmds = [
  "npx prisma migrate deploy",
  "npm run seed"  # ⚠️ Hanya jika perlu
]
```

**Catatan:** Seed menggunakan `upsert`, jadi aman dijalankan berulang, tapi tidak perlu setiap deploy.

## 📁 File yang Harus Ter-Commit

Pastikan file berikut ter-commit ke GitHub:

```
gudangkuBE/
├── prisma/
│   ├── schema.prisma          ✅ Harus commit
│   └── migrations/            ✅ Harus commit (PENTING!)
│       ├── migration_lock.toml
│       └── 20251105064523_first_migrate/
│           └── migration.sql
├── seed-demo.js               ✅ Harus commit
├── package.json               ✅ Harus commit
└── nixpacks.toml              ✅ Harus commit
```

**Cek apakah migrations ter-commit:**
```bash
cd "D:\ZUAM\WMS SC\gudangkuBE"
git ls-files prisma/migrations/
```

Jika tidak ada output, berarti migrations belum ter-commit!

## 🔍 Checklist untuk Production

### Sebelum Deploy Pertama:

- [ ] Folder `prisma/migrations/` sudah ter-commit ke GitHub
- [ ] File `seed-demo.js` sudah ter-commit
- [ ] `nixpacks.toml` sudah dikonfigurasi dengan benar
- [ ] `package.json` memiliki script `build` dan `seed`

### Setelah Deploy:

- [ ] Cek logs Railway, pastikan `prisma migrate deploy` berhasil
- [ ] Cek logs, pastikan `prisma generate` berhasil
- [ ] Test API endpoint untuk memastikan database terhubung
- [ ] Jalankan seed manual untuk pertama kali (jika perlu)

## 🔄 Workflow Migrate di Production

### 1. Buat Migration Baru (Local)

```bash
# Di local, buat migration baru
npx prisma migrate dev --name nama_migration

# Commit migration files
git add prisma/migrations/
git commit -m "Add new migration: nama_migration"
git push origin main
```

### 2. Deploy ke Railway

```bash
# Push ke GitHub
git push origin main

# Railway akan otomatis:
# 1. Build (npm install + prisma generate)
# 2. Deploy (prisma migrate deploy)
# 3. Start (npm start)
```

### 3. Verifikasi

1. Cek Railway logs
2. Pastikan migration berhasil
3. Test API untuk memastikan schema baru bekerja

## 🎯 Best Practices

### 1. Migrate

✅ **DO:**
- Selalu commit migration files ke GitHub
- Test migration di local sebelum push
- Gunakan `migrate deploy` di production (bukan `migrate dev`)

❌ **DON'T:**
- Jangan edit migration file yang sudah di-commit
- Jangan skip migration di production
- Jangan gunakan `migrate dev` di production

### 2. Seed

✅ **DO:**
- Gunakan `upsert` untuk menghindari duplikat
- Seed hanya untuk data master/demo
- Jalankan seed manual, tidak otomatis setiap deploy

❌ **DON'T:**
- Jangan seed data production yang sensitif
- Jangan seed setiap deploy (waste resources)
- Jangan hardcode credentials di seed script

### 3. Generate

✅ **DO:**
- Biarkan Railway generate Prisma Client otomatis
- Pastikan `prisma generate` ada di build process

❌ **DON'T:**
- Jangan commit generated Prisma Client ke GitHub
- Jangan skip generate di build

## 🐛 Troubleshooting

### Error: "Migration not found"

**Penyebab:** Folder `prisma/migrations/` tidak ter-commit

**Solusi:**
```bash
git add prisma/migrations/
git commit -m "Add Prisma migrations"
git push origin main
```

### Error: "Schema drift detected"

**Penyebab:** Database schema tidak sesuai dengan migration

**Solusi:**
```bash
# Di Railway, jalankan:
railway run npx prisma migrate reset  # HATI-HATI: Hapus semua data!
railway run npx prisma migrate deploy
```

### Error: "Seed failed"

**Penyebab:** Database belum di-migrate atau connection error

**Solusi:**
1. Pastikan migration sudah berhasil
2. Cek DATABASE_URL di Railway Variables
3. Test connection dulu

## 📚 Referensi

- [Prisma Migrate Guide](https://www.prisma.io/docs/guides/migrate)
- [Prisma Production Deployment](https://www.prisma.io/docs/guides/deployment)
- [Railway CLI Docs](https://docs.railway.app/develop/cli)

