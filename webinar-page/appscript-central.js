// ============================================================
// LEGALSPOT — Centralized Apps Script (One for ALL Events)
// CARA PAKAI:
// 1. Buka https://script.google.com → New Project
// 2. Paste seluruh kode ini
// 3. Klik Deploy → New Deployment → Web App → Anyone
// 4. Copy URL Web App → paste ke js/config.js (DEFAULT_GAS_ENDPOINT)
// ============================================================

// -------------------------------------------------------
// MAIN HANDLER
// -------------------------------------------------------
function doPost(e) {
  try {
    const raw = e.postData ? e.postData.contents : JSON.stringify(e.parameter);
    let data;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      data = e.parameter || {};
    }

    // Ambil Spreadsheet ID dan Sheet (Tab) Name secara dinamis dari request
    const spreadsheetId = data.spreadsheet_id || data.spreadsheetId || '13fjU1cVYPHFg4m5yfzBjae9Q8P3WDn89wGxVuINTnSI';
    const sheetName     = data.sheet_name || data.sheetName || data.event_name || 'EventRegistrations';
    const eventName     = data.event_name || 'Event Legalspot';
    const waAdmin       = data.wa_admin || '6287893268929';

    const ss    = SpreadsheetApp.openById(spreadsheetId);
    let   sheet = ss.getSheetByName(sheetName);

    // Auto-create sheet tab jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Header row otomatis dari key data yang dikirim (selain metadata teknis)
      const excludeKeys = ['action', 'eventSlug', 'spreadsheet_id', 'spreadsheetId', 'sheet_name', 'sheetName', 'event_name', 'wa_admin'];
      const headers = ['Timestamp', ...Object.keys(data).filter(k => !excludeKeys.includes(k))];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }

    // Sanitasi nomor WA
    const waKey = Object.keys(data).find(k => k.toLowerCase().includes('wa') || k.toLowerCase().includes('whatsapp'));
    if (waKey && data[waKey]) data[waKey] = String(data[waKey]).replace(/\s+/g, '');

    // Tentukan kolom dari header baris pertama
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row     = headers.map(h => {
      if (h === 'Timestamp') return new Date();
      // Handle "Lainnya" logic if present
      if (h.toLowerCase().includes('sumber') && data[h] === 'Lainnya') {
          const manualKey = Object.keys(data).find(k => k.toLowerCase().includes('manual'));
          return data[manualKey] || 'Lainnya';
      }
      return data[h] || '';
    });
    sheet.appendRow(row);

    // Kirim email konfirmasi jika ada email pendaftar
    const emailKey = Object.keys(data).find(k => k.toLowerCase().includes('email'));
    if (emailKey && data[emailKey]) {
      _sendConfirmationEmail(data[emailKey], data, eventName, waAdmin);
    }

    return _response({ status: 'OK' });
  } catch (err) {
    return _response({ status: 'ERROR', message: err.toString() });
  }
}

// -------------------------------------------------------
// EMAIL KONFIRMASI (Dynamic)
// -------------------------------------------------------
function _sendConfirmationEmail(recipientEmail, data, eventName, waAdmin) {
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const nameKey = Object.keys(data).find(k => k.toLowerCase().includes('nama')) || 'Peserta';
  const attendeeName = data[nameKey] || 'Peserta';

  const htmlBody = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; background:#f3f4f6; margin:0; padding:40px 0; color:#111827; line-height:1.6; }
    .wrap { max-width:600px; margin:0 auto; background:#ffffff; border:1px solid rgba(0,0,0,0.08); }
    .hdr { background:#0b2d69; padding:24px 32px; }
    .hdr img { display:block; }
    .body { padding:32px; }
    .btn { display:inline-block; background:#0b2d69; color:#fff !important; text-decoration:none;
           padding:16px 32px; border-radius:6px; font-weight:800; font-size:15px; }
    .wa-btn { display:block; background:#25D366; color:#fff !important; text-decoration:none;
              padding:14px; border-radius:6px; font-weight:700; text-align:center; margin-top:20px; }
    .info-box { background:#f9fafb; border-left:3px solid #0b2d69; padding:20px; margin:24px 0; border-radius:4px; }
    .label { display:block; font-size:10px; color:#4b5563; text-transform:uppercase; font-weight:600; letter-spacing:1px; }
    .val   { font-size:14px; color:#111827; font-weight:700; }
    .footer { padding:32px; text-align:center; font-size:11px; color:#4b5563; opacity:.5; }
  </style>
</head>
<body>
<table width="100%" bgcolor="#f3f4f6" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 0">
  <table width="600" class="wrap" cellpadding="0" cellspacing="0">
    <tr>
      <td class="hdr">
        <img src="https://res.cloudinary.com/dr1hbseck/image/upload/v1768720240/logo-legalspot_udwweq.png" alt="LEGALSPOT" width="130">
      </td>
    </tr>
    <tr>
      <td class="body">
        <p style="font-size:16px;margin-top:0;color:#4b5563">Halo <strong>${esc(attendeeName)}</strong>,</p>
        <p style="color:#4b5563">Terima kasih telah mendaftar di event <strong>${esc(eventName)}</strong>. Pendaftaranmu berhasil kami terima! 🎉</p>
        <p style="color:#4b5563">Tim Legalspot sedang memproses verifikasi pembayaranmu. Harap kirimkan bukti transfer melalui WhatsApp admin kami.</p>

        <div style="text-align:center;margin:32px 0">
          <a href="https://wa.me/${waAdmin}?text=Halo%20Admin%20Legalspot%2C%20saya%20sudah%20daftar%20${encodeURIComponent(eventName)}%2C%20berikut%20bukti%20pembayarannya." class="btn">Konfirmasi Pembayaran</a>
        </div>

        <div class="info-box">
          <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0b2d69;">Detail Pendaftaran:</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" valign="top" style="padding-bottom:12px">
                <span class="label">Event</span>
                <span class="val">${esc(eventName)}</span>
              </td>
              <td width="50%" valign="top" style="padding-bottom:12px">
                <span class="label">Nama Peserta</span>
                <span class="val">${esc(attendeeName)}</span>
              </td>
            </tr>
          </table>
        </div>

        <p style="font-size:14px;color:#4b5563">Pantau selalu WhatsApp dan email kamu untuk informasi terbaru. Sampai jumpa di event!</p>
        <div style="padding-top:32px;border-top:1px solid rgba(0,0,0,0.08);font-size:14px;color:#4b5563">
          Salam hangat,<br>
          <strong style="color:#111827;display:block;margin-top:8px">Tim Legalspot</strong>
        </div>
        <a href="https://wa.me/${waAdmin}" class="wa-btn">Hubungi Admin Legalspot</a>
      </td>
    </tr>
    <tr>
      <td class="footer">
        &copy; 2026 LEGALSPOT — PT Integrasia Solusi Nusantara<br>
        Jl. Mabes Hankam No. 71, Cipayung, Jakarta Timur
      </td>
    </tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  MailApp.sendEmail({
    to:       String(recipientEmail).trim(),
    subject:  `✅ Pendaftaran ${eventName} Berhasil!`,
    body:     `Halo ${attendeeName},\n\nPendaftaran ${eventName} berhasil diterima.\nTim Legalspot`,
    htmlBody: htmlBody
  });
}

// -------------------------------------------------------
// UTIL
// -------------------------------------------------------
function _response(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run once to authorize MailApp
function testAuth() {
  const me = Session.getEffectiveUser().getEmail();
  MailApp.sendEmail({ to: me, subject: 'Test Auth', body: 'MailApp authorized.' });
}
