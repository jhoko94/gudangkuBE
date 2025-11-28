# 🌱 Seed Data ke Neon Database

## ✅ Status

- ✅ Database sudah terhubung ke Neon
- ✅ Tabel sudah ada (migrate berhasil)
- ⚠️  Data master belum ada (perlu seed)

## 🚀 Cara Menjalankan Seed

### Opsi 1: Via Local (Paling Mudah)

1. **Update .env di Local**
   - Buka file `.env` di folder `gudangkuBE`
   - Pastikan DATABASE_URL mengarah ke Neon:
     ```env
     DATABASE_URL="postgresql://user:password@neon-host/database?sslmode=require"
     ```

2. **Jalankan Seed**
   ```bash
   cd "D:\ZUAM\WMS SC\gudangkuBE"
   npm run seed:safe
   ```

3. **Verifikasi**
   - Cek di Neon dashboard atau pgAdmin
   - Tabel seharusnya sudah berisi data

### Opsi 2: Via Railway (Jika masih pakai Railway)

Jika backend masih di Railway tapi database di Neon:

1. **Update DATABASE_URL di Railway**
   - Railway Dashboard → Service `gudangkuBE` → Variables
   - Update `DATABASE_URL` dengan connection string dari Neon

2. **Jalankan Seed via Railway CLI**
   ```bash
   railway run npm run seed:safe
   ```

3. **Atau Update Start Command**
   - Railway Settings → Start Command
   - Gunakan: `npm run start:production` (sudah include seed otomatis)

### Opsi 3: Via Neon SQL Editor

Jika ingin manual, bisa jalankan SQL langsung di Neon:

1. Buka Neon Dashboard
2. Pilih database
3. Buka SQL Editor
4. Jalankan script seed (akan saya buatkan)

## 📝 Data yang Akan Ditambahkan

Setelah seed berhasil, akan ada:

- **5 Master Pemasok** (P001-P005)
- **7 Master Tujuan** (T001-T007)
- **25 Master Barang** (B001-B025)

## 🔍 Verifikasi

### Cek di Neon Dashboard:

1. Buka Neon Dashboard
2. Pilih database
3. Buka **"Table Editor"** atau **"SQL Editor"**
4. Jalankan query:
   ```sql
   SELECT COUNT(*) FROM "Barang";
   SELECT COUNT(*) FROM "Pemasok";
   SELECT COUNT(*) FROM "Tujuan";
   ```
5. Seharusnya melihat:
   - Barang: 25
   - Pemasok: 5
   - Tujuan: 7

### Cek via API:

```bash
# Test endpoint
curl https://your-app.railway.app/api/barang
curl https://your-app.railway.app/api/pemasok
curl https://your-app.railway.app/api/tujuan
```

Seharusnya return array dengan data.

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Solusi:**
- Pastikan DATABASE_URL benar
- Pastikan Neon database sudah running
- Pastikan connection string format benar (dengan `?sslmode=require`)

### Error: "Seed failed"

**Solusi:**
- Cek logs untuk detail error
- Pastikan tabel sudah ada
- Pastikan DATABASE_URL benar

### Data tidak muncul

**Solusi:**
1. Cek apakah seed benar-benar berjalan (lihat logs)
2. Cek apakah ada error di logs
3. Coba jalankan seed lagi (aman karena pakai upsert)

## ✅ Checklist

- [ ] DATABASE_URL sudah di-update ke Neon
- [ ] Tabel sudah ada (migrate berhasil)
- [ ] Seed sudah dijalankan
- [ ] Verifikasi data muncul di database
- [ ] Test API endpoint untuk memastikan data ter-load

