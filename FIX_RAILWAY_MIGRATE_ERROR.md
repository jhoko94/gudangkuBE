# 🔧 Fix Railway Migration Error

## ❌ Error yang Terjadi

```
Error: P1001: Can't reach database server at 'postgres.railway.internal:5432'
"npx prisma migrate deploy" did not complete successfully: exit code: 1
```

## 🔍 Penyebab

**Masalah:** `npx prisma migrate deploy` dijalankan di **build phase**, padahal:
1. Database service belum ready saat build
2. DATABASE_URL mungkin belum ter-set saat build
3. Railway internal network (`postgres.railway.internal`) hanya bisa diakses saat runtime, bukan build time

## ✅ Solusi yang Sudah Diterapkan

### 1. Pindahkan Migrate dari Build ke Start Command

**Sebelum (nixpacks.toml):**
```toml
[phases.build]
cmds = [
  "npx prisma migrate deploy"  # ❌ Error: DB belum ready
]
```

**Sesudah (nixpacks.toml):**
```toml
[phases.build]
cmds = []  # ✅ Kosong, migrate dipindah ke start
```

### 2. Update start-with-seed.js

Script sekarang akan:
1. ✅ Jalankan migrate dulu (database sudah ready saat start)
2. ✅ Jalankan seed (jika perlu)
3. ✅ Start server

## 🚀 Setup di Railway

### Start Command di Railway Settings:

```
npm run start:with-seed
```

**Atau jika tidak pakai seed:**

```
npx prisma migrate deploy && npm start
```

## 📝 Urutan Eksekusi yang Benar

### Build Phase (nixpacks.toml):
1. Install dependencies: `npm install`
2. Generate Prisma Client: `npx prisma generate`
3. ~~Migrate~~ (dipindah ke start)

### Start Phase (start command):
1. Run migrations: `npx prisma migrate deploy` ✅
2. Check & seed (jika perlu): `node seed-demo-safe.js`
3. Start server: `npm start`

## 🔄 Workflow yang Benar

```
Build Time:
├── npm install
├── npx prisma generate
└── (Build selesai)

Start Time (Database sudah ready):
├── npx prisma migrate deploy  ✅
├── node seed-demo-safe.js (jika perlu)
└── npm start
```

## ✅ Checklist

- [x] Hapus migrate dari `nixpacks.toml` build phase
- [x] Update `start-with-seed.js` untuk include migrate
- [x] Update start command di Railway Settings
- [ ] Commit dan push perubahan
- [ ] Deploy ulang di Railway
- [ ] Verifikasi migrate berhasil di logs

## 🧪 Testing

### Test di Local:

```bash
# Test start dengan migrate dan seed
npm run start:with-seed
```

### Test di Railway:

1. Set start command: `npm run start:with-seed`
2. Deploy ulang
3. Cek logs, seharusnya melihat:
   - `🔄 Running database migrations...`
   - `✅ Migrations completed`
   - `✅ Data sudah ada, skip seeding` (atau seed jika kosong)
   - `🚀 Starting server...`

## 🔍 Troubleshooting

### Error: "Migration still fails"

**Kemungkinan:**
- DATABASE_URL belum ter-set di Railway Variables
- PostgreSQL service belum running

**Solusi:**
1. Pastikan PostgreSQL service sudah dibuat di Railway
2. Pastikan DATABASE_URL sudah di-set di Variables
3. Cek PostgreSQL service status (harus running)

### Error: "Prisma Client not generated"

**Solusi:**
- Pastikan `npx prisma generate` ada di install phase (sudah ada ✅)

### Error: "Seed fails"

**Solusi:**
- Seed error tidak akan crash server (sudah di-handle)
- Cek logs untuk detail error

## 📚 Referensi

- [Railway Build vs Runtime](https://docs.railway.app/develop/builds)
- [Prisma Migrate Deploy](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)

