# 🔄 Restart Server Backend

## ⚠️ Error yang Terjadi

Error: "Endpoint tidak ditemukan: DELETE /api/barang/MB00001"

## ✅ Solusi

Server backend perlu di-restart setelah perubahan kode untuk memuat endpoint DELETE yang baru.

## 🚀 Cara Restart

### Jika menggunakan `npm run dev` (nodemon):

1. **Hentikan server** (Ctrl+C di terminal)
2. **Jalankan lagi:**
   ```bash
   cd "D:\ZUAM\WMS SC\gudangkuBE"
   npm run dev
   ```

### Jika menggunakan `npm start`:

1. **Hentikan server** (Ctrl+C di terminal)
2. **Jalankan lagi:**
   ```bash
   cd "D:\ZUAM\WMS SC\gudangkuBE"
   npm start
   ```

## ✅ Verifikasi

Setelah restart, coba hapus barang lagi. Seharusnya:
- ✅ Tidak ada error "Endpoint tidak ditemukan"
- ✅ Jika barang masih digunakan, muncul pesan error yang jelas
- ✅ Jika barang tidak digunakan, berhasil dihapus

## 🔍 Troubleshooting

### Masih error setelah restart?

1. **Cek apakah server benar-benar restart:**
   - Lihat di terminal, pastikan ada log "Server running on port..."
   - Pastikan tidak ada error saat start

2. **Cek apakah endpoint DELETE ada:**
   - Buka `gudangkuBE/index.js`
   - Cari `app.delete('/api/barang/:id'`
   - Pastikan ada di file

3. **Cek urutan route:**
   - Route `/api/barang/:id/barcodes` harus SEBELUM `/api/barang/:id`
   - Ini sudah diperbaiki di kode terbaru

### Port sudah digunakan?

```bash
# Windows PowerShell
netstat -ano | findstr :3000
# Lihat PID, lalu:
taskkill /PID <PID> /F
```

## 📝 Catatan

- Setelah perubahan kode backend, **selalu restart server**
- Nodemon seharusnya auto-restart, tapi kadang perlu restart manual
- Jika masih error, cek console backend untuk detail error

