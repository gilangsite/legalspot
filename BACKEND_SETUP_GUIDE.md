# 🛠️ Legalspot Backend Setup Guide

Dokumen ini berisi langkah-langkah lengkap untuk menghubungkan website Legalspot dengan **Google Spreadsheet, Apps Script, dan Google Drive**.

---

## 1. Persiapan Google Spreadsheet

1. Buka [Google Sheets](https://sheets.new).
2. Beri nama file: `Legalspot_Database`.
3. Buat 3 Tab (Sheets) di bagian bawah dengan nama persis seperti berikut:
   *   **Mitra** (Untuk data pendaftar mitra)
   *   **Orders** (Untuk data checkout product)
   *   **Settings** (Untuk kode diskon & info dashboard)

### Header Kolom (Baris 1):
*   **Tab Mitra**: `ID`, `Timestamp`, `Nama`, `Pendidikan`, `Universitas`, `Usia`, `Domisili`, `Email`, `WhatsApp`, `Sumber_Info`, `Refferal`, `Status`
*   **Tab Orders**: `ID`, `Timestamp`, `Product`, `Nama`, `Email`, `Bisnis`, `Omzet`, `Kategori`, `Subtotal`, `Discount_Code`, `Total`, `Status`

---

## 2. Setup Google Apps Script (Backend API)

1. Di dalam Google Sheets, klik menu **Extensions** > **Apps Script**.
2. Hapus semua kode di editor `Code.gs` dan paste kode dari file `backend/code.gs` yang sudah saya buatkan.
3. **Konfigurasi Variabel**:
   *   Cari baris `const SS_ID = "...";`
   *   Ganti dengan ID Spreadsheet Anda (ambil dari URL Sheets Anda: `docs.google.com/spreadsheets/d/ID_DISINI/edit`).
   *   Cari baris `const WA_ADMIN_LINK = "...";` dan masukkan link grup WhatsApp Anda.
4. Klik icon **Save** (diskette).

---

## 3. Deploy sebagai Web App

1. Klik tombol biru **Deploy** > **New Deployment**.
2. Pilih type: **Web App**.
3. Isi kolom:
   *   **Description**: `Legalspot Backend v1`
   *   **Execute as**: `Me` (Email Anda)
   *   **Who has access**: `Anyone` (PENTING: Agar website bisa mengirim data).
4. Klik **Deploy**.
5. Salin **Web App URL** yang muncul (ujungnya `/exec`).

---

## 4. Hubungkan ke Website (Frontend)

1. Buka file `js/config.js` di folder project Anda.
2. Paste URL yang Anda salin tadi ke bagian `GAS_ENDPOINT`:
   ```javascript
   const LEGALSPOT_CONFIG = {
     GAS_ENDPOINT: 'https://script.google.com/macros/s/PASTE_ID_DISINI/exec',
     // ...
   };
   ```

---

## 5. Integrasi Google Drive (File Storage)

Jika nanti Anda ingin mengupload file (misal: Bukti Transfer atau CV Mitra), ikuti pola ini di `code.gs`:

1. Cari ID Folder Drive Anda.
2. Gunakan fungsi `DriveApp.getFolderById(FOLDER_ID).createFile(blob)`.
3. Pastikan izin Apps Script sudah di-authorize untuk mengakses Drive saat pertama kali running.

---

## 6. Cyber Security (Obfuscation)

Setelah sistem backend berjalan lancar:
1. Anda bisa menggunakan tools seperti [javascript-obfuscator](https://obfuscator.io/) untuk file `.js` di frontend.
2. **Kelebihan**: Membuat source code sulit dibaca orang awam/malware.
3. **Penting**: Simpan file original di folder private (jangan di-commit ke public repo).

---

## 7. Verifikasi Email Konfirmasi

Aplikasi ini menggunakan `MailApp.sendEmail`. 
*   Email akan dikirim atas nama akun Google Anda.
*   Template email sudah menggunakan **Electric Navy & Blue Theme** yang kontras dan premium.

---

### Tips Error Handling
Jika data tidak masuk ke sheet:
1. Check **Browser Console (F12)** untuk melihat apakah ada error `CORS` atau `404`.
2. Pastikan Status Deployment Apps Script adalah **Anyone**.
3. Pastikan ID Spreadsheet sudah benar.
