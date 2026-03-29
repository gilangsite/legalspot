// ============================================================
// LEGALSPOT — Integrated Apps Script (Admin Dashboard + All Events)
// ============================================================

const CONFIG = {
  // Legacy Spreadsheet & Drive Folder
  SS_ID: "1INUYQ8KXnTGvvM3Nnm8B2U5i6oPACXTBCmNcp0G80Tc",
  DRIVE_FOLDER_ID: "1MxxVOuSCsId2VyS5oMSnLR8WxWiiK_qY",
  EVENT_POSTERS_FOLDER_ID: "1ctywoxyBu44pGeh8TbK_qfCZSOAcVm6I",
  
  ADMIN: {
    PASSWORD: "Legalspot2026$$",
    EMAIL: "admin@legalspot.id"
  },
  WA_CS_NUMBER: "6287893268929"
};

// -------------------------------------------------------
// MAIN HANDLERS
// -------------------------------------------------------

function doGet(e) {
  try {
    const action = e.parameter.action;
    const auth = e.parameter.auth;

    if (auth !== CONFIG.ADMIN.PASSWORD) {
      _logEvent("UNAUTHORIZED_ACCESS", "Failed dashboard GET access experiment", null);
      return ContentService.createTextOutput("Unauthorized").setMimeType(ContentService.MimeType.TEXT);
    }

    if (action === "getDashboardData") {
      const ss = SpreadsheetApp.openById(CONFIG.SS_ID);
      const partners = _getSheetData(ss, "mitra_submissions");
      const orders = _getSheetData(ss, "client_orders");
      return _response({ status: "success", partners, orders });
    }

    return _response({ status: "error", message: "Invalid action" });
  } catch (err) {
    return _response({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  try {
    const raw = e.postData ? e.postData.contents : JSON.stringify(e.parameter);
    let data;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      data = e.parameter || {};
    }

    const action = data.action;

    // --- Action: uploadPoster ---
    if (action === 'uploadPoster') {
      const folder = DriveApp.getFolderById(CONFIG.EVENT_POSTERS_FOLDER_ID);
      const fileName = data.fileName || ('poster_' + new Date().getTime());
      const base64Data = data.fileBase64.indexOf(",") !== -1 ? data.fileBase64.split(",")[1] : data.fileBase64;
      const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), data.mimeType, fileName);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return _response({ status: 'OK', fileId: file.getId() });
    }

    // --- Action: adminAction (Update Status) ---
    if (action === "adminAction") {
      if (data.auth !== CONFIG.ADMIN.PASSWORD) {
         return _response({ status: "error", message: "Unauthorized" });
      }
      return _handleAdminAction(data);
    }

    // --- Action: getDashboardData (Post fallback) ---
    if (action === "getDashboardData") {
      if (data.auth !== CONFIG.ADMIN.PASSWORD) return _response({ status: "error", message: "Unauthorized" });
      const ss = SpreadsheetApp.openById(CONFIG.SS_ID);
      const partners = _getSheetData(ss, "mitra_submissions");
      const orders = _getSheetData(ss, "client_orders");
      return _response({ status: "success", partners, orders });
    }

    // --- Action: registerPartner (Mitra) ---
    if (action === "registerPartner") {
      return _registerPartner(data);
    }

    // --- Action: submitOrder (Checkout) ---
    if (action === "submitOrder") {
      return _submitOrder(data);
    }

    // --- DEFAULT: Dynamic Event Registration ---
    return _handleEventRegistration(data);

  } catch (err) {
    return _response({ status: 'ERROR', message: err.toString() });
  }
}

// -------------------------------------------------------
// ACTION HANDLERS
// -------------------------------------------------------

function _handleEventRegistration(data) {
  const spreadsheetId = data.spreadsheet_id || data.spreadsheetId || CONFIG.SS_ID;
  const sheetName     = data.sheet_name || data.sheetName || data.event_name || 'EventRegistrations';
  const eventName     = data.event_name || 'Event Legalspot';
  const waAdmin       = data.wa_admin || CONFIG.WA_CS_NUMBER;

  const ss    = SpreadsheetApp.openById(spreadsheetId);
  let   sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const excludeKeys = ['action', 'eventSlug', 'spreadsheet_id', 'spreadsheetId', 'sheet_name', 'sheetName', 'event_name', 'wa_admin', 'auth'];
    const headers = ['Timestamp', ...Object.keys(data).filter(k => !excludeKeys.includes(k))];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => {
    if (h === 'Timestamp') return new Date();
    return data[h] || '';
  });
  sheet.appendRow(row);

  const emailKey = Object.keys(data).find(k => k.toLowerCase().includes('email'));
  if (emailKey && data[emailKey]) {
    _sendConfirmationEmail(data[emailKey], data, eventName, waAdmin);
  }

  return _response({ status: 'OK' });
}

function _registerPartner(data) {
  const sheet = _getOrCreateSheet("mitra_submissions", ["timestamp", "nama", "pendidikan", "universitas", "usia", "domisili", "sumber_info", "referral", "email", "whatsapp", "status"]);
  const nama = data.nama_lengkap || data.nama || "";
  sheet.appendRow([new Date(), nama, data.pendidikan || "", data.universitas || "", data.usia || "", data.domisili || "", data.sumber_info || "", data.referral || "", data.email || "", data.whatsapp || "", "PENDING"]);
  return _response({ status: "success", message: "Data berhasil disimpan" });
}

function _handleAdminAction(data) {
  const ss = SpreadsheetApp.openById(CONFIG.SS_ID);
  if (data.actionType === "updateMitraStatus") {
    const sheet = ss.getSheetByName("mitra_submissions");
    const rows = sheet.getDataRange().getValues();
    let rowIndex = -1;
    for(let i=1; i<rows.length; i++) {
      if (rows[i][8] === data.userEmail) { // Email is col 8
        rowIndex = i + 1;
        break;
      }
    }
    if (rowIndex !== -1) {
      sheet.getRange(rowIndex, 11).setValue(data.status); // Status is col 11
      return _response({ status: "success", message: "Status mitra berhasil diupdate" });
    }
  }
  return _response({ status: "error", message: "Aksi tidak ditemukan" });
}

function _submitOrder(data) {
  const sheet = _getOrCreateSheet("client_orders", ["timestamp", "nama", "bisnis", "omzet", "kategori", "produk", "harga_awal", "diskon", "harga_final", "email", "whatsapp", "file_url", "status"]);
  const harga_final = data.harga_final || 0;
  sheet.appendRow([new Date(), data.nama || "", data.bisnis || "", data.omzet || "", data.kategori || "", data.produk || "", 0, 0, harga_final, data.email || "", data.whatsapp || "", "", "PENDING"]);
  return _response({ status: "success", message: "Data berhasil disimpan" });
}

// -------------------------------------------------------
// HELPERS
// -------------------------------------------------------

function _getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.openById(CONFIG.SS_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setBackground("#1e40af").setFontColor("white").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function _getSheetData(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, idx) => obj[h] = row[idx]);
    return obj;
  });
}

function _response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.TEXT);
}

function _logEvent(type, msg, stack) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SS_ID);
    let sheet = ss.getSheetByName("admin_logs") || ss.insertSheet("admin_logs");
    sheet.appendRow([new Date(), type, msg, stack || ""]);
  } catch(e) {}
}

function _sendConfirmationEmail(recipientEmail, data, eventName, waAdmin) {
  // Logic from appscript-central.js
  const nameKey = Object.keys(data).find(k => k.toLowerCase().includes('nama')) || 'Peserta';
  const attendeeName = data[nameKey] || 'Peserta';
  const subject = `✅ Pendaftaran ${eventName} Berhasil!`;
  const body = `Halo ${attendeeName},\n\nPendaftaran ${eventName} berhasil diterima. Terima kasih!`;
  MailApp.sendEmail({ to: recipientEmail, subject: subject, body: body });
}

// -------------------------------------------------------
// AUTHORIZATION TRIGGER
// -------------------------------------------------------
// JIKA MUNCUL ERROR "TIDAK MEMILIKI IZIN" (PERMISSION DENIED):
// 1. Pilih fungsi "authorizeAllServices" di toolbar atas Apps Script editor
// 2. Klik tombol "Run" (ikon ▶️)
// 3. Ikuti jendela pop-up untuk memberikan izin akses Google Drive & Sheets
function authorizeAllServices() {
  const me = Session.getActiveUser().getEmail();
  const root = DriveApp.getRootFolder().getName();
  const ss = SpreadsheetApp.openById(CONFIG.SS_ID).getName();
  Logger.log('Authorized for: ' + me + '. Access to Drive (' + root + ') and Sheets (' + ss + ') is OK.');
}
