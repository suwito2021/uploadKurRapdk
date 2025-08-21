// ===============================================================
// FILE: Code.gs (Diperbarui dengan Deadline & Penilaian)
// ===============================================================

// --- KONFIGURASI ---
const SPREADSHEET_ID = "1h1Xv2Wr3LqYkUFVa9-I2Vh4Jw8aoLkGpf25fPHxuFr8";
const SHEET_NAME = "DataUpload";
const DRIVE_FOLDER_ID = "13-1Uz_RatyXKYS8KyK8_w7IX1I23hp7k";

// --- BATAS WAKTU DIUBAH DI SINI ---
// Format: TAHUN, BULAN (0-11), TANGGAL, JAM, MENIT, DETIK
// Batas waktu 21 Agustus 2025 pukul 23:59:59 (Bulan Agustus adalah indeks 7)
const DEADLINE = new Date(2025, 7, 21, 23, 59, 59);


/**
 * Fungsi ini berjalan ketika pengguna mengakses URL Web App.
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle("Upload Rapor Pendidikan & Kurikulum 2025")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    // Baris ini ditambahkan agar web app bisa ditampilkan di dalam iframe (misalnya di GitHub Pages)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Fungsi ini dipanggil dari JavaScript di sisi klien (frontend)
 * untuk memproses file dan menyimpan data.
 */
function uploadFilesAndData(payload) {
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const currentTime = new Date(); // Waktu saat ini ketika fungsi dipanggil

    // 1. Proses dan upload file (tidak berubah)
    const fileKurikulum = payload.fileKurikulum;
    const blobKurikulum = Utilities.newBlob(Utilities.base64Decode(fileKurikulum.base64), fileKurikulum.type, fileKurikulum.name);
    const newFileKurikulum = folder.createFile(blobKurikulum);
    const linkKurikulum = newFileKurikulum.getUrl();

    const fileRapor = payload.fileRapor;
    const blobRapor = Utilities.newBlob(Utilities.base64Decode(fileRapor.base64), fileRapor.type, fileRapor.name);
    const newFileRapor = folder.createFile(blobRapor);
    const linkRapor = newFileRapor.getUrl();
    
    // 2. Tentukan status penilaian berdasarkan waktu
    let penilaian;
    if (currentTime <= DEADLINE) {
      penilaian = "Tepat Waktu";
    } else {
      penilaian = "Terlambat";
    }

    // 3. Simpan metadata ke Google Sheets
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const newRow = [
      currentTime.getTime(), payload.namaSekolah, payload.jenjang, payload.status,
      linkKurikulum, linkRapor,
      currentTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      "Berhasil", penilaian
    ];
    sheet.appendRow(newRow);

    // 4. Kirim balasan sukses ke frontend
    return JSON.stringify({ status: "success", message: "Dokumen berhasil diupload!" });

  } catch (error) {
    throw new Error("Gagal di sisi server: " + error.message);
  }
}


/**
 * Fungsi ini dipanggil dari frontend untuk mengambil semua data dari sheet.
 */
function getSheetData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const range = sheet.getRange(1, 1, sheet.getLastRow(), 9);
    const data = range.getValues();
    data.shift();
    return data;
  } catch (error) {
    throw new Error("Gagal mengambil data dari Sheet: " + error.message);
  }
}
