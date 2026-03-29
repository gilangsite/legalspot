// KONFIGURASI PENTING
// Ganti URL di bawah ini dengan URL Web App Google Apps Script Anda yang sebenarnya.
// Contoh format: https://script.google.com/macros/s/AKfycbx.../exec
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxV69yhqbFy-5OmnV_qprZl2kytkQ5dDr8LIRDshx4E8Sbp2bs69s6RGIMVGRuID15m9g/exec'; // <--- GANTI INI

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');
    const sumberSelect = document.getElementById('sumber');
    const sumberManual = document.getElementById('sumber_manual');

    // 1. Handle Dropdown "Yang lain"
    window.handleSumberChange = function () {
        if (sumberSelect.value === 'Lainnya') {
            sumberManual.classList.remove('hidden');
            sumberManual.setAttribute('required', 'true');
        } else {
            sumberManual.classList.add('hidden');
            sumberManual.removeAttribute('required');
            sumberManual.value = ''; // Reset jika disembunyikan
        }
    };

    // 2. Handle Copy to Clipboard
    window.copyToClipboard = function () {
        // Ambil text dari elemen
        const textToCopy = document.getElementById('scopy-text').innerText;

        // Copy ke clipboard
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Tampilkan toast notifikasi
            const toast = document.getElementById('copy-toast');
            toast.className = "toast show";
            setTimeout(function () { toast.className = toast.className.replace("show", ""); }, 3000);
        }).catch(err => {
            console.error('Gagal menyalin: ', err);
            alert('Gagal menyalin. Silakan seleksi dan salin manual.');
        });
    };

    // 3. Handle Form Submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validasi Sederhana Tambahan
        const waInput = document.getElementById('wa');
        let waValue = waInput.value.trim();

        // Bersihkan karakter non-angka
        waValue = waValue.replace(/[^0-9]/g, '');

        // Validasi format Indonesia (opsional, tapi disarankan)
        if (waValue.startsWith('0')) {
            // Ubah 08xx jadi 628xx jika diperlukan oleh backend, atau biarkan 08xx
            // Standard format intl: 628...
            // Di sini kita biarkan sesuai input user angka saja, tapi bisa kita format
            waValue = '62' + waValue.substring(1);
        } else if (waValue.startsWith('62')) {
            // Good
        } else {
            // Asumsi user input 8xxxxx -> tambahkan 62
            waValue = '62' + waValue;
        }

        // Update nilai input WA sebelum dikirim (opsional) atau masukkan ke FormData
        // Kita biarkan user input as is di FormData, tapi kita bisa validasi length
        if (waValue.length < 10) {
            alert('Nomor WhatsApp tidak valid. Mohon periksa kembali.');
            return;
        }

        // Siapkan Data
        const formData = new FormData(form);

        // Handle logika "Sumber" manual
        // Jika "Lainnya" dipilih, ambil value dari input manual, replace value di formData
        if (formData.get('Sumber') === 'Lainnya') {
            formData.set('Sumber', formData.get('Sumber_Manual'));
        }
        // Hapus field helper dari formData agar tidak terkirim ke sheet (opsional, sheet terima saja extra fields)
        formData.delete('Sumber_Manual');


        // UI Loading State
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sedang Mengirim...';
        successMsg.classList.add('hidden');
        errorMsg.classList.add('hidden');

        // Kirim via Fetch
        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData,
            // Mode 'no-cors' penting jika Apps Script tidak handle OPTIONS preflight sempurna 
            // ATAU jika kita tidak butuh membaca response JSON-nya. 
            // Apps Script Web App default redirect akan bekerja dengan baik form-like.
            // Namun, untuk error handling yang akurat, idealnya backend return JSON + CORS header.
            // Di sini kita pakai asumsi default GAS behavior.
        })
            .then(response => {
                // Karena 'no-cors' (opaque response) atau redirect, kita anggap sukses jika tidak throw error
                // Kalau backend return JSON dengan CORS OK, kita bisa check response.ok

                // Simulasi sukses untuk UX
                console.log('Success!', response);
                showSuccess();
            })
            .catch(error => {
                console.error('Error!', error.message);
                showError();
            });
    });

    function showSuccess() {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Daftar Sekarang';
        form.reset();
        // Sembunyikan form atau biarkan, tampilkan pesan sukses
        form.style.display = 'none';
        successMsg.classList.remove('hidden');

        // Scroll ke pesan
        successMsg.scrollIntoView({ behavior: 'smooth' });
    }

    function showError() {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Daftar Sekarang';
        errorMsg.classList.remove('hidden');
    }
});
