/**
 * Legalspot Backend - Google Apps Script
 * Version: 1.0
 * 
 * Functions:
 * - Handles Partner Registrations
 * - Handles Product Orders (Checkout)
 * - Admin Dashboard API (Fetch & Update)
 * - Automated HTML Emails
 */

const SS_ID = "YOUR_SPREADSHEET_ID_HERE"; // Ganti dengan ID Spreadsheet Anda
const ADMIN_PASSWORD = "BismillahCuan2026";
const ADMIN_EMAIL = "admin@legalspot.id";
const WA_ADMIN_LINK = "https://chat.whatsapp.com/EXAMPLE_GROUP_LINK"; // Link group mitra

// --- MAIN HANDLERS ---

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const ss = SpreadsheetApp.openById(SS_ID);
    
    if (action === "registerPartner") {
      return registerPartner(ss, data);
    } else if (action === "submitOrder") {
      return submitOrder(ss, data);
    } else if (action === "adminAction") {
      // Basic Auth Check
      if (data.auth !== ADMIN_PASSWORD) return errorResponse("Unauthorized");
      return handleAdminAction(ss, data);
    }
    
    return errorResponse("Invalid action");
  } catch (err) {
    return errorResponse(err.toString());
  }
}

function doGet(e) {
  const action = e.parameter.action;
  const auth = e.parameter.auth;
  
  if (auth !== ADMIN_PASSWORD) return ContentService.createTextOutput("Unauthorized").setMimeType(ContentService.MimeType.TEXT);
  
  try {
    const ss = SpreadsheetApp.openById(SS_ID);
    if (action === "getDashboardData") {
      const partners = getSheetData(ss, "Mitra");
      const orders = getSheetData(ss, "Orders");
      const settings = getSheetData(ss, "Settings");
      
      return successResponse({ partners, orders, settings });
    }
  } catch (err) {
    return errorResponse(err.toString());
  }
}

// --- SUB-HANDLERS ---

function registerPartner(ss, data) {
  const sheet = ss.getSheetByName("Mitra");
  const timestamp = new Date();
  const id = "PTR-" + timestamp.getTime();
  
  sheet.appendRow([
    id,
    timestamp,
    data.nama,
    data.pendidikan,
    data.universitas,
    data.usia,
    data.domisili,
    data.email,
    data.whatsapp,
    data.sumberInfo,
    data.refferalName || "-",
    "Pending" // Status
  ]);
  
  // Send Confirmation Email
  sendConfirmationEmail(data.email, data.nama, "partner");
  
  return successResponse({ id: id, message: "Partner registration successful" });
}

function submitOrder(ss, data) {
  const sheet = ss.getSheetByName("Orders");
  const timestamp = new Date();
  const id = "ORD-" + timestamp.getTime();
  
  sheet.appendRow([
    id,
    timestamp,
    data.product,
    data.nama,
    data.email,
    data.bisnis,
    data.omzet,
    data.kategori,
    data.subtotal,
    data.discountCode || "-",
    data.total,
    "Payment Pending"
  ]);
  
  // Send Order Email
  sendConfirmationEmail(data.email, data.nama, "order", data.product);
  
  return successResponse({ id: id, message: "Order submitted" });
}

function handleAdminAction(ss, data) {
  const sheetName = data.type === "mitra" ? "Mitra" : "Orders";
  const sheet = ss.getSheetByName(sheetName);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      sheet.getRange(i + 1, data.type === "mitra" ? 12 : 12).setValue(data.status);
      
      // If Partner Action
      if (data.type === "mitra") {
        const email = rows[i][7];
        const nama = rows[i][2];
        if (data.status === "Accepted") {
          sendApprovalEmail(email, nama, true);
        } else if (data.status === "Declined") {
          sendApprovalEmail(email, nama, false);
        }
      }
      break;
    }
  }
  return successResponse({ message: "Status updated" });
}

// --- HELPERS ---

function getSheetData(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const result = [];
  for (let i = 1; i < data.length; i++) {
    let obj = {};
    headers.forEach((h, idx) => obj[h] = data[i][idx]);
    result.push(obj);
  }
  return result;
}

function successResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({ status: "success", data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- EMAIL ENGINE ---

function sendConfirmationEmail(email, nama, type, detail = "") {
  let subject = "";
  let htmlBody = "";
  
  const headerColor = "#1e40af"; // Electric Navy
  const accentColor = "#3b82f6"; // Electric Blue
  
  if (type === "partner") {
    subject = "Legalspot Mitra — Konfirmasi Pendaftaran";
    htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; background: #fafafa;">
        <div style="background: ${headerColor}; padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Legalspot Mitra</h1>
        </div>
        <div style="padding: 30px; color: #333; line-height: 1.6;">
          <h2 style="color: ${headerColor};">Halo, ${nama}!</h2>
          <p>Terima kasih telah mendaftar sebagai calon Mitra Legalspot. Data Anda telah kami terima dan sedang dalam tahap kurasi oleh tim internal kami.</p>
          <p>Kami akan segera memberitahu hasil kurasi melalui email ini dalam waktu 2-3 hari kerja.</p>
          <div style="background: white; border-left: 4px solid ${accentColor}; padding: 15px; margin: 20px 0;">
             <strong>Catatan:</strong> Pastikan WhatsApp Anda aktif untuk komunikasi lebih lanjut jika diperlukan.
          </div>
          <p style="margin-top: 30px;">Salam hangat,<br><strong>Tim Legalspot Indonesia</strong></p>
        </div>
        <div style="background: #eee; padding: 20px; text-align: center; font-size: 12px; color: #888;">
          &copy; 2026 PT Integrasia Solusi Nusantara. All rights reserved.
        </div>
      </div>
    `;
  } else {
    subject = `Order Konfirmasi: ${detail}`;
    htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background: ${headerColor}; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Legalspot Order</h1>
        </div>
        <div style="padding: 30px; color: #333;">
          <h2>Halo, ${nama}</h2>
          <p>Pesanan Anda untuk <strong>${detail}</strong> telah terdaftar di sistem kami.</p>
          <p>Status pembayaran Anda saat ini sedang diverifikasi oleh tim administrasi.</p>
          <div style="padding: 20px; background: #f0f7ff; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;">Silakan konfirmasi melalui WhatsApp jika Anda belum melakukannya untuk mempercepat proses aktivasi layanan.</p>
          </div>
          <p>Terima kasih telah mempercayakan urusah pajak Anda kepada kami.</p>
        </div>
      </div>
    `;
  }
  
  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody
  });
}

function sendApprovalEmail(email, nama, isAccepted) {
  let subject = isAccepted ? "Selamat! Anda diterima sebagai Mitra Legalspot" : "Update Mengenai Pendaftaran Mitra Legalspot";
  let htmlBody = "";
  
  if (isAccepted) {
    htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; background: #fff; border: 1px solid #ddd; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0;">WELCOME TO THE TEAM! 🎉</h1>
        </div>
        <div style="padding: 30px;">
          <h2>Halo ${nama},</h2>
          <p>Berdasarkan hasil kurasi tim Legalspot, kami sangat senang untuk memberitahu bahwa Anda <strong>DETERIMA</strong> sebagai Mitra Legalspot.</p>
          <p>Langkah selanjutnya, silakan bergabung ke grup koordinasi mitra kami melalui link di bawah ini:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${WA_ADMIN_LINK}" style="background: #25d366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">JOIN WA GROUP MITRA</a>
          </div>
          <p>Mari bangun ekosistem perpajakan digital yang lebih baik bersama Legalspot.</p>
        </div>
      </div>
    `;
  } else {
    htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #ddd; border-radius: 12px;">
        <h2>Halo ${nama},</h2>
        <p>Terima kasih atas minat Anda bergabung dengan Legalspot.</p>
        <p>Mohon maaf, saat ini pendaftaran Mitra Legalspot sedang <strong>Over Demand</strong>. Kami terpaksa membatasi kuota mitra untuk menjaga kualitas pelayanan.</p>
        <p>Data Anda tetap tersimpan di database kami, dan kami akan menghubungi Anda kembali jika ada pembukaan gelombang berikutnya.</p>
        <p>Tetap semangat!</p>
      </div>
    `;
  }
  
  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody
  });
}
