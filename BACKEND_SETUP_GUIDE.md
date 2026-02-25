# 🛠️ Legalspot Backend Setup Guide (v2.0)

Dokumen ini berisi langkah-langkah lengkap untuk menghubungkan website Legalspot dengan **Google Spreadsheet, Apps Script, dan Google Drive**. Versi ini mendukung pendaftaran mitra, order produk, promo code, dan sistem log admin.

---

## 1. Persiapan Google Spreadsheet

1. Buka [Google Sheets](https://sheets.new).
2. Beri nama file: `Legalspot_Database_2026`.
3. Buat 4 Tab (Sheets) di bagian bawah dengan nama **persis** (case-sensitive) seperti berikut:
   *   **mitra_submissions** (Untuk data pendaftar mitra)
   *   **client_orders** (Untuk data checkout product)
   *   **promo_codes** (Untuk sistem diskon)
   *   **admin_logs** (Untuk tracking error & aktivitas)

### Header Kolom (Baris 1):
*   **Tab mitra_submissions**: `timestamp`, `nama`, `pendidikan`, `universitas`, `usia`, `domisili`, `sumber_info`, `referral`, `email`, `whatsapp`, `status`
*   **Tab client_orders**: `timestamp`, `nama`, `bisnis`, `omzet`, `kategori`, `produk`, `harga_awal`, `diskon`, `harga_final`, `email`, `whatsapp`, `file_url`, `status`
*   **Tab promo_codes**: `kode`, `discount_value`, `active` (Isi contoh: `LEGAL2026`, `50000`, `TRUE`)
*   **Tab admin_logs**: `timestamp`, `event_type`, `message`, `error_stack`

---

## 2. Setup Google Drive (Storage)

1. Buka [Google Drive](https://drive.google.com).
2. Buat folder baru bernama `Legalspot_Uploads`.
3. Buka folder tersebut, lihat URL di browser.
4. Salin ID folder (karakter setelah `/folders/...`).
   * *Contoh ID:* `1A2b3C4d5E6f_G7h8I9j0K...`

---

## 3. Setup Google Apps Script

1. Di dalam Google Sheets tadi, klik menu **Extensions** > **Apps Script**.
2. Beri nama project: `Legalspot_Backend`.
3. Hapus semua kode di editor `Code.gs` dan paste kode dari file `backend/code.gs` yang terbaru.
4. **Konfigurasi CONFIG (Baris 15-25)**:
   *   `SS_ID`: Masukkan ID Spreadsheet Anda.
   *   `DRIVE_FOLDER_ID`: Masukkan ID Folder Drive yang tadi disalin.
   *   `ADMIN.PASSWORD`: Ganti jika ingin password admin dashboard berbeda.
   *   `WA_CS_NUMBER`: Nomor WhatsApp CS (format `62...`).
5. Klik icon **Save** (diskette).

---

## 4. Deploy sebagai Web App

1. Klik tombol biru **Deploy** > **New Deployment**.
2. Pilih type: **Web App**.
3. Konfigurasi:
   *   **Description**: `Legalspot Production v2`
   *   **Execute as**: `Me`
   *   **Who has access**: `Anyone` (PENTING).
4. Klik **Deploy**.
5. Muncul popup **Authorize Access**, klik **Allow** agar script bisa mengakses Sheet, Email, dan Drive Anda.
6. Salin **Web App URL** (ujungnya `/exec`).

---

## 5. Hubungkan ke Website (Frontend)

1. Buka file `js/config.js` di folder project Anda.
2. Paste URL yang Anda salin ke bagian `GAS_ENDPOINT`.
3. Simpan file dan upload/push ke server/GitHub.

---

## 6. Verifikasi & Testing

### Cara Test:
1. Isi form pendaftaran mitra di website.
2. Cek apakah data masuk ke tab `mitra_submissions`.
3. Cek apakah Anda menerima email konfirmasi.
4. Jika gagal, cek tab `admin_logs` untuk melihat detail erornya.

---

### Tips Troubleshooting
*   **Data tidak masuk?** Pastikan nama tab di Sheet sama persis dengan yang ada di code.gs.
*   **Error 401/Unauthorized?** Pastikan URL yang dipanggil di frontend adalah URL `/exec` yang terbaru setelah dideploy.
*   **Drive Error?** Pastikan Anda sudah klik "Allow" saat otorisasi DriveApp.
