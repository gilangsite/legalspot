# LEGALSPOT WEBSITE

## Final Concept & Technical Documentation

---

## 1. Brand & Positioning

Legalspot adalah brand layanan perpajakan digital di bawah PT Integrasia Solusi Nusantara, berfokus pada solusi pajak modern berbasis sistem Coretax.

Nilai utama brand:

* Digital-first tax service
* Trustworthy & professional
* Futuristic, minimalis, high-tech

Target user:

* Individu (WP Pribadi)
* Pelaku usaha (UMKM hingga bisnis berkembang)
* Calon mitra pajak Legalspot

---

## 2. Website Structure

### Public Pages

1. Home / Main Page

   * Company Profile (strict & to the point)
   * CEO Speech
   * About Us
   * Vision & Mission
   * Primary CTA (Layanan Pajak & Daftar Mitra)

2. Product Page (Etalase Layanan)

   * Daftar layanan Legalspot
   * Detail produk
   * CTA Checkout

3. Partner Registration Page

   * Form pendaftaran mitra Legalspot

4. Tax Insight Page

   * Artikel / berita perpajakan
   * SEO-friendly

---

## 3. Frontend Design System

### Visual Style

* Style: Minimalis, Elegan, Futuristic
* Nuansa: High-tech, premium, clean

### Color System

Primary Color:

* Hitam (background utama)

Secondary Color:

* Biru navy (aksen, CTA, highlight)

Neutral:

* Abu gelap & abu terang untuk teks

### Typography

Font Family:

* Garet

Font Usage:

* Garet SemiBold / Bold: headline, section title (slimmer for minimalist look)
* Garet Regular: body text, form, label

Headline wajib menggunakan gradient:

* Hitam → Abu
* Hitam → Biru Navy

### UI Rules

* Shadow lembut pada card, modal, button
* Glass / glossy effect pada modal dan card penting
* Gradient hanya untuk headline, CTA, hover
* Icon wajib pada button penting (style monoline, futuristik)
* Responsive optimal untuk desktop & mobile

---

## 4. Form Pendaftaran Mitra Legalspot

Field:

* Nama Lengkap
* Background Pendidikan (Dropdown):

  * Mahasiswa Aktif
  * Sarjana Akuntansi
  * Sarjana Perpajakan
  * Sarjana Ekonomi
* Nama Universitas
* Usia (Input angka + label "Tahun")
* Domisili
* Mengetahui Informasi Legalspot (Dropdown):

  * Social Media
  * WhatsApp Group
  * Google
  * Iklan
  * Referral (muncul field nama referensi)

Flow:

* Submit → data masuk Spreadsheet (status: PENDING)
* Email otomatis: konfirmasi penerimaan data
* Admin dapat Accept / Decline
* Accept → email diterima + link WhatsApp Group Mitra
* Decline → email soft rejection (over demand)

---

## 5. Client Checkout Flow (Manual Payment)

### Step 1 – Pilih Product

* Client memilih layanan Legalspot
* Klik Checkout

### Step 2 – Form Data Client

Field:

* Nama Lengkap
* Nama Bisnis
* Omzet Bisnis 1 Tahun:

  * < 100 Juta
  * 100 Juta – 1 Miliar
  * > 1 Miliar
* Kategori Bisnis (Dropdown):

  * Retail
  * FMCG
  * Food & Beverage
  * E-Commerce
  * Jasa Profesional
  * Manufaktur
  * Distribusi & Grosir
  * Startup / Digital Product
  * Kesehatan
  * Pendidikan
  * Properti
  * Transportasi & Logistik
  * Fashion
  * Agribisnis
  * Lainnya (custom input)

Button: Confirm Order

### Step 3 – Pembayaran

Ringkasan harga:

* Harga awal
* Diskon
* Harga setelah diskon
* Pajak (jika ada)
* Total harga final

Kode Diskon:

* Input kode
* Validasi dari Dashboard Admin

Detail Transfer:

* Bank: BRI
* No Rekening: 114801010102504
* a.n Zain Patra Caraka
* Button Copy Nomor Rekening

Checkbox:

* Saya sudah melakukan transfer

Button:

* Confirmed Order

### Step 4 – After Submit

* Order masuk Spreadsheet (status: PAYMENT_CHECK)
* Email otomatis: pembayaran akan dicek
* Redirect ke WhatsApp Admin dengan pesan otomatis:

"Halo Legalspot, Nama saya (Nama Lengkap) dari (Nama Bisnis).
Saya baru aja checkout service Legalspot (Nama Product) dan sudah melakukan Pembayaran.
Tolong dibantu Proses lebih lanjut, Terima kasih."

---

## 6. Admin Dashboard

### Auth

* Email: [admin@legalspot.id](mailto:admin@legalspot.id)
* Password: disimpan hashed
* Role: Super Visior (single role)

### Fitur Admin

* Login
* Product Management (CRUD + upload image)
* Diskon Management (kode, tipe, nilai)
* Tax Insight Management (publish / draft)
* Partner Submission Review (Accept / Decline)
* Order List & Payment Status
* Error Log Monitoring

---

## 7. Backend & Data Architecture

### Backend

* Google Apps Script sebagai middleware
* Web App endpoint untuk:

  * Submit form mitra
  * Submit order client
  * Trigger email otomatis
  * Logging error

### Database

* Google Spreadsheet

Sheet utama:

* Partners
* Orders
* Products
* Discount Codes
* Insights
* Error Logs

### File Storage

* Google Drive
* Struktur folder:

  * /Legalspot/Partners
  * /Legalspot/Products
  * /Legalspot/Insights

---

## 8. Email Automation

Email otomatis menggunakan Apps Script:

* Partner registration confirmation
* Partner accepted
* Partner declined
* Order received

---

## 9. Error Handling & Security

* Error dicatat ke Error Logs Sheet
* Admin menerima email jika Apps Script gagal
* Tidak ada credential di frontend
* Validasi input frontend & backend
* CAPTCHA pada public form

---

## 10. Scaling Roadmap (Future)

* Upgrade payment gateway (Mitrans)
* Replace Spreadsheet dengan database proper
* Multi-admin & role-based access
* Analytics & dashboard insight
* Subscription service
* WhatsApp API automation

---

## STATUS

Website Concept: FINAL
Frontend Design: LOCKED
Backend Flow: LOCKED
Ready for Coding & Execution
