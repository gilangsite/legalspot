/**
 * Legalspot Backend - Google Apps Script
 * Version: 2.0 (Production Ready)
 * 
 * Features:
 * - Partner Registration & Checkout Flow
 * - Google Spreadsheet Integration
 * - Email Automation
 * - Drive File Upload
 * - Admin Logs & Error Handling
 * - Basic Hardcoded Security
 */

// --- CONFIGURATION (Do NOT expose to client) ---
const CONFIG = {
  SS_ID: "1INUYQ8KXnTGvvM3Nnm8B2U5i6oPACXTBCmNcp0G80Tc",
  DRIVE_FOLDER_ID: "1MxxVOuSCsId2VyS5oMSnLR8WxWiiK_qY",
  ADMIN: {
    EMAIL: "admin@legalspot.id",
    PASSWORD: "Legalspot2026$$",
    ROLE: "SUPER_VISIOR"
  },
  WA_ADMIN_LINK: "",
  WA_CS_NUMBER: "6287893268929" // For checkout redirection
};

// --- MAIN HANDLERS ---

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Data tidak diterima oleh server.");
    }
    
    let data;
    try {
      // Mencoba parse JSON
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      // Jika gagal JSON, coba parse as form parameters (fallback)
      data = e.parameter;
    }
    
    if (!data || !data.action) {
      throw new Error("Action tidak ditentukan.");
    }

    const action = data.action;
    
    if (action === "adminAction") {
      if (data.auth !== CONFIG.ADMIN.PASSWORD) {
        logEvent("UNAUTHORIZED_ACCESS", "Failed admin POST authentication attempt", null);
        return errorResponse("Unauthorized access");
      }
      return handleAdminAction(data);
    }
    
    if (action === "registerPartner") {
      return registerPartner(data);
    } else if (action === "submitOrder") {
      return submitOrder(data);
    } else if (action === "getDashboardData") {
      const ss = SpreadsheetApp.openById(CONFIG.SS_ID);
      const partners = getSheetData(ss, "mitra_submissions");
      const orders = getSheetData(ss, "client_orders");
      return successResponse({ partners, orders });
    }
    
    return errorResponse("Action '" + action + "' tidak valid.");
  } catch (err) {
    logEvent("DO_POST_ERROR", err.message, err.stack);
    return errorResponse("Internal server error: " + err.message);
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    const auth = e.parameter.auth;
    
    // Simple admin dashboard endpoint
    if (auth !== CONFIG.ADMIN.PASSWORD) {
      logEvent("UNAUTHORIZED_ACCESS", "Failed dashboard GET access attempt", null);
      return ContentService.createTextOutput("Unauthorized").setMimeType(ContentService.MimeType.TEXT);
    }
    
    if (action === "getDashboardData") {
      const ss = SpreadsheetApp.openById(CONFIG.SS_ID);
      const partners = getSheetData(ss, "mitra_submissions");
      const orders = getSheetData(ss, "client_orders");
      
      return successResponse({ partners, orders });
    }
    
    return errorResponse("Invalid action");
  } catch (err) {
    logEvent("DO_GET_ERROR", err.message, err.stack);
    return errorResponse("Internal server error");
  }
}

// --- CORE FUNCTIONS ---

function registerPartner(data) {
  try {
    const sheet = getOrCreateSheet("mitra_submissions", [
      "timestamp", "nama", "pendidikan", "universitas", "usia", "domisili", "sumber_info", "referral", "email", "whatsapp", "status"
    ]);
    
    const timestamp = new Date();
    const nama = data.nama_lengkap || data.nama || "";
    const pendidikan = data.background_pendidikan || data.pendidikan || "";
    const universitas = data.universitas || "";
    const usia = data.usia || "";
    const domisili = data.domisili || "";
    const sumber = data.sumber_info || data.sumberInfo || "";
    const referral = data.referral_name || data.refferalName || data.referral || "";
    const email = data.email || "";
    const wa = data.whatsapp || "";

    sheet.appendRow([
      timestamp, nama, pendidikan, universitas, usia, domisili, sumber, referral, email, wa, "PENDING"
    ]);
    
    if (email) {
      sendEmail(email, "Konfirmasi Pendaftaran Mitra Legalspot", buildPartnerRegistrationEmail(nama));
    }
    
    return successResponse("Data berhasil disimpan");
  } catch (err) {
    logEvent("REGISTER_PARTNER_ERROR", err.message, err.stack);
    return errorResponse("Gagal menyimpan data mitra: " + err.message);
  }
}

function submitOrder(data) {
  try {
    const sheet = getOrCreateSheet("client_orders", [
      "timestamp", "nama", "bisnis", "omzet", "kategori", "produk", "harga_awal", "diskon", "harga_final", "email", "whatsapp", "file_url", "status"
    ]);
    
    const timestamp = new Date();
    const nama = data.nama_lengkap || data.nama || "";
    const bisnis = data.nama_bisnis || data.bisnis || "";
    const omzet = data.omzet_tahunan || data.omzet || "";
    const kategori = data.kategori_bisnis || data.kategori || "";
    const produk = data.product_name || data.product || data.produk || "";
    const email = data.email || "";
    const wa = data.whatsapp || "";
    const promoCode = data.promo_code || data.discountCode || data.promoCode || "";
    
    let harga_awal = Number(data.harga_awal) || Number(data.subtotal) || 0;
    let diskonValue = 0;
    
    if (promoCode) {
      const promos = getSheetData(SpreadsheetApp.openById(CONFIG.SS_ID), "promo_codes");
      const promo = promos.find(p => p.kode === promoCode && String(p.active).toUpperCase() === "TRUE");
      if (promo) diskonValue = Number(promo.discount_value) || 0;
    }
    
    let harga_final = Number(data.harga_final) || Number(data.total) || (harga_awal - diskonValue);
    if (harga_final < 0) harga_final = 0;
    
    let fileUrl = "";
    if (data.payment_proof_base64) {
      fileUrl = uploadFileToDrive(data.payment_proof_base64, data.payment_proof_name || "payment_proof.jpg", data.payment_proof_mime || "image/jpeg");
    }
    
    sheet.appendRow([
      timestamp, nama, bisnis, omzet, kategori, produk, harga_awal, diskonValue, harga_final, email, wa, fileUrl, "PENDING"
    ]);
    
    const formatRp = (num) => "Rp " + num.toLocaleString('id-ID');
    if (email) {
      sendEmail(email, "Order Konfirmasi - Legalspot", buildOrderEmail(nama, produk, formatRp(harga_final)));
    }
    
    const waMessage = encodeURIComponent(`Halo Tim Legalspot,\nSaya ${nama} telah memesan layanan ${produk}.\nTotal Pembayaran: ${formatRp(harga_final)}\nMohon bantuannya untuk verifikasi.`);
    const waLink = `https://wa.me/${CONFIG.WA_CS_NUMBER}?text=${waMessage}`;
    
    return successResponse({ message: "Data berhasil disimpan", wa_link: waLink });
  } catch (err) {
    logEvent("SUBMIT_ORDER_ERROR", err.message, err.stack);
    return errorResponse("Gagal memproses order: " + err.message);
  }
}

function handleAdminAction(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SS_ID);
    
    if (data.actionType === "updateMitraStatus") {
      const sheet = ss.getSheetByName("mitra_submissions");
      if (!sheet) throw new Error("Sheet mitra_submissions not found");
      const rows = sheet.getDataRange().getValues();
      
      let rowIndex = -1;
      let emailPos = 8; // Assumed column index (0-based) for email
      let namePos = 1;
      let statusCol = 11; // Assumed column number (1-based) for status
      
      let targetEmail = "";
      let targetName = "";
      
      // Look for the specific row by exact email identifier
      for(let i=1; i<rows.length; i++) {
        if (rows[i][emailPos] === data.userEmail) { 
          rowIndex = i + 1;
          targetName = rows[i][namePos];
          targetEmail = rows[i][emailPos];
          break;
        }
      }
      
      if (rowIndex !== -1) {
        // Rewrite Status
        sheet.getRange(rowIndex, statusCol).setValue(data.status);
        
        // Trigger Email Notification
        if (data.status === "ACCEPTED") {
          sendEmail(targetEmail, "Selamat! Pendaftaran Mitra Diterima 🎉", buildMitraAcceptedEmail(targetName));
        } else if (data.status === "DECLINED") {
          sendEmail(targetEmail, "Update Pendaftaran Mitra Legalspot", buildMitraDeclinedEmail(targetName));
        }
        
        return successResponse("Status mitra berhasil diupdate");
      } else {
        throw new Error("Data mitra berdasarkan email tidak ditemukan");
      }
    }
    
    return errorResponse("Aksi admin tidak dikenali");
  } catch (err) {
    logEvent("ADMIN_ACTION_ERROR", err.message, err.stack);
    return errorResponse("Gagal memproses aksi admin");
  }
}

// --- UTILS & HELPERS ---

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.openById(CONFIG.SS_ID);
  let sheet = ss.getSheetByName(name);
  
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    // Format header
    sheet.getRange(1, 1, 1, headers.length).setBackground("#1e40af").setFontColor("white").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function uploadFileToDrive(base64Data, fileName, mimeType) {
  try {
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    
    // Clean base64 header if exists (e.g "data:image/jpeg;base64,")
    const cleanBase64 = base64Data.indexOf(",") !== -1 ? base64Data.split(",")[1] : base64Data;
    
    const blob = Utilities.newBlob(Utilities.base64Decode(cleanBase64), mimeType, fileName);
    const file = folder.createFile(blob);
    
    // Open viewer permissions
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file.getUrl();
  } catch (err) {
    logEvent("DRIVE_UPLOAD_ERROR", err.message, err.stack);
    return ""; // Return empty string to allow flow to continue without file
  }
}

function getSheetData(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length === 0) return [];
  
  const headers = data[0];
  const result = [];
  for (let i = 1; i < data.length; i++) {
    let obj = {};
    headers.forEach((h, idx) => obj[h] = data[i][idx]);
    result.push(obj);
  }
  return result;
}

function sendEmail(to, subject, htmlBody) {
  try {
    MailApp.sendEmail({
      to: to,
      subject: subject,
      htmlBody: htmlBody
    });
  } catch (err) {
    // Failing to send email should NOT crash the request, but MUST be logged
    logEvent("EMAIL_ERROR", `Failed sending to ${to}: ` + err.message, err.stack);
  }
}

function logEvent(eventType, message, stack) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SS_ID);
    let sheet = ss.getSheetByName("admin_logs");
    if (!sheet) {
      sheet = ss.insertSheet("admin_logs");
      sheet.appendRow(["timestamp", "event_type", "message", "error_stack"]);
    }
    
    sheet.appendRow([
      new Date(),
      eventType,
      message,
      stack || ""
    ]);
  } catch(e) {
    // Failsafe exit
  }
}

function successResponse(dataObj) {
  const result = {
    status: "success",
    message: typeof dataObj === 'string' ? dataObj : dataObj.message || "Berhasil"
  };
  
  if (typeof dataObj === 'object') {
    Object.assign(result, dataObj);
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({ 
    status: "error", 
    message: msg 
  })).setMimeType(ContentService.MimeType.JSON);
}

// --- HTML EMAIL TEMPLATES ---

function buildPartnerRegistrationEmail(nama) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #1e40af; padding: 24px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Pendaftaran Diterima</h2>
    </div>
    <div style="padding: 32px; color: #1e293b;">
      <p style="font-size: 16px;">Halo <strong>${nama}</strong>,</p>
      <p style="line-height: 1.6;">Terima kasih telah mendaftar sebagai mitra Legalspot. Kami telah menerima data Anda dengan baik.</p>
      <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; color: #475569; font-size: 14px;">Saat ini pendaftaran Anda berstatus <strong>PENDING</strong> dan sedang dikurasi oleh tim Legalspot. Informasi lebih lanjut akan kami kirimkan ke email ini.</p>
      </div>
      <p>Salam hangat,<br>Tim Legalspot Indonesia</p>
    </div>
  </div>`;
}

function buildMitraAcceptedEmail(nama) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #16a34a; padding: 24px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Selamat Bergabung! 🎉</h2>
    </div>
    <div style="padding: 32px; color: #1e293b;">
      <p style="font-size: 16px;">Halo <strong>${nama}</strong>,</p>
      <p style="line-height: 1.6;">Kami sangat gembira memberitahukan bahwa pendaftaran Anda diterima! Anda kini resmi tergabung dan memiliki status <strong>ACCEPTED</strong>.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${CONFIG.WA_ADMIN_LINK}" style="background-color: #1e40af; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Masuk Grup WhatsApp Mitra</a>
      </div>
      <p>Kami tunggu partisipasinya dan mari bersinergi bersama Legalspot!</p>
    </div>
  </div>`;
}

function buildMitraDeclinedEmail(nama) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="padding: 32px; color: #1e293b;">
      <p style="font-size: 16px;">Halo <strong>${nama}</strong>,</p>
      <p style="line-height: 1.6;">Terima kasih atas minat dan antusiasme Anda untuk bergabung sebagai mitra Legalspot.</p>
      <div style="background-color: #fff1f2; padding: 16px; border-radius: 6px; margin: 24px 0;">
        <p style="margin: 0; color: #be123c;">Mohon maaf, saat ini pendaftaran Mitra Legalspot sedang <strong>Over Demand</strong>. Kami terpaksa membatasi kuota agar kualitas pelayanan tetap terjaga, sehingga kami belum bisa memproses aplikasi Anda lebih lanjut.</p>
      </div>
      <p>Data Anda telah tercatat dengan aman, dan kami akan menghubungi Anda kembali di kesempatan pembukaan pendaftaran berikutnya.</p>
      <p>Sukses selalu,<br>Tim Legalspot Indonesia</p>
    </div>
  </div>`;
}

function buildOrderEmail(nama, product, price) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #1e40af; padding: 24px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Menunggu Pembayaran</h2>
    </div>
    <div style="padding: 32px; color: #1e293b;">
      <p style="font-size: 16px;">Halo <strong>${nama}</strong>,</p>
      <p style="line-height: 1.6;">Pesanan Anda telah berhasil direkam oleh sistem kami.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px; margin: 24px 0;">
        <ul style="list-style-type: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 8px;"><strong>Layanan:</strong> ${product}</li>
          <li style="margin-bottom: 8px;"><strong>Total:</strong> <span style="color: #1e40af; font-weight: bold;">${price}</span></li>
          <li><strong>Status:</strong> PENDING</li>
        </ul>
      </div>
      <p style="line-height: 1.6;">Tim Legalspot saat ini sedang mengecek dan memverifikasi data serta bukti pembayaran Anda. Kami akan menghubungi Anda kembali sebentar lagi bila verifikasi berhasil.</p>
    </div>
  </div>`;
}
