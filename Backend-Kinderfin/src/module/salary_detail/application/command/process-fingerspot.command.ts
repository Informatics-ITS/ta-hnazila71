import SalaryDetailRepository from "../../infrastructure/repository/salary_detail.repository";
import calculateSalary from "./calculate-salary.command"

interface FingerspotRecord {
  pin: string;       // NIP guru
  scan_date: string; // Format: "YYYY-MM-DD HH:MM:SS"
  verify: number;    // Metode verifikasi
  status_scan: number; // 0: scan masuk, 1: scan keluar
}

/**
 * Proses data absensi dari API Fingerspot
 * Hanya memproses scan masuk (0) dan scan keluar (1)
 */
async function processFingerspotRecords(records: FingerspotRecord[]): Promise<{ processed: number; skipped: number }> {
  if (!records || !Array.isArray(records) || records.length === 0) {
    return { processed: 0, skipped: 0 };
  }

  // Hanya proses scan masuk (0) dan scan keluar (1)
  const validRecords = records.filter(
    record => record.status_scan === 0 || record.status_scan === 1
  );

  if (validRecords.length === 0) {
    return { processed: 0, skipped: 0 };
  }

  // Kelompokkan data berdasarkan NIP dan tanggal
  const recordsByNipAndDate = new Map<string, any>();
  
  validRecords.forEach(record => {
    const [dateStr, timeStr] = record.scan_date.split(' ');
    const key = `${record.pin}-${dateStr}`;
    
    if (!recordsByNipAndDate.has(key)) {
      recordsByNipAndDate.set(key, {
        nip: record.pin,
        tanggal: dateStr,
        waktu: null,
        jam_keluar: null
      });
    }
    
    const existingRecord = recordsByNipAndDate.get(key);
    
    // Update jam masuk atau jam keluar berdasarkan status_scan
    if (record.status_scan === 0) { // Scan masuk
      existingRecord.waktu = timeStr;
    } else if (record.status_scan === 1) { // Scan keluar
      existingRecord.jam_keluar = timeStr;
    }
    
    recordsByNipAndDate.set(key, existingRecord);
  });

  // Konversi map ke array
  const attendanceRecords = Array.from(recordsByNipAndDate.values());
  
  // Proses data absensi untuk perhitungan gaji
  return await calculateSalary(attendanceRecords, "manual");
}

export { processFingerspotRecords };