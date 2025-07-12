import { Request, Response } from "express";
import { processFingerspotRecords } from "../../application/command/process-fingerspot.command";
import { FINGERSPOT_CONFIG } from "../../../../config/fingerspot.config";

interface FingerspotAttendanceRecord {
  pin: string;       // NIP guru
  scan_date: string; // Format: "YYYY-MM-DD HH:MM:SS"
  verify: number;    // Metode verifikasi
  status_scan: number; // 0: scan masuk, 1: scan keluar
}

interface FingerspotResponse {
  success: boolean;
  trans_id: string;
  data: FingerspotAttendanceRecord[];
}

class FingerspotController {
  /**
   * Memproses data absensi dari API Fingerspot
   * Hanya memproses scan masuk (0) dan scan keluar (1)
   */
  static async processAttendanceData(req: Request, res: Response) {
    try {
      const fingerspotResponse = req.body as FingerspotResponse;
      
      if (!fingerspotResponse.success || !fingerspotResponse.data || !Array.isArray(fingerspotResponse.data)) {
        return res.status(400).json({
          success: false,
          message: "Format data Fingerspot tidak valid",
        });
      }

      // Proses data Fingerspot menggunakan command
      const result = await processFingerspotRecords(fingerspotResponse.data);
      
      return res.status(200).json({
        success: true,
        message: `Berhasil memproses ${result.processed} data, ${result.skipped} data dilewati`,
        processed: result.processed,
        skipped: result.skipped
      });
    } catch (error: any) {
      console.error("Error memproses data Fingerspot:", error);
      return res.status(500).json({
        success: false,
        message: error?.message || "Error memproses data absensi",
      });
    }
  }

  /**
   * Mengambil dan memproses data dari API Fingerspot
   * Format request body persis sama dengan dokumentasi API Fingerspot:
   * {"trans_id":"1", "cloud_id":"xxxxx", "start_date":"2020-07-27", "end_date":"2020-07-25"}
   */
  static async fetchAndProcessAttendance(req: Request, res: Response) {
    try {
      // Ambil cloud_id dari environment variables jika tidak disediakan dalam request
      const defaultCloudId = process.env.FINGERSPOT_CLOUD_ID || "xxxxx";
      
      // Validasi body request sesuai format API Fingerspot
      const { trans_id = "1", cloud_id = defaultCloudId, start_date, end_date } = req.body;
      
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: "Field yang dibutuhkan tidak lengkap: start_date, end_date",
        });
      }

      // Pastikan rentang tanggal tidak lebih dari 2 hari (sesuai dokumentasi)
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 2) {
        return res.status(400).json({
          success: false,
          message: "Rentang tanggal tidak boleh lebih dari 2 hari sesuai batasan API Fingerspot",
        });
      }

      // Gunakan body request yang sama persis sesuai dokumentasi
      const requestBody = {
        trans_id: trans_id || "1",
        cloud_id: cloud_id || FINGERSPOT_CONFIG.CLOUD_ID,
        start_date,
        end_date
      };

      // Kirim request ke API Fingerspot
      const response = await fetch(FINGERSPOT_CONFIG.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${FINGERSPOT_CONFIG.API_TOKEN}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Error API Fingerspot: ${response.status} ${response.statusText}`);
      }

      const fingerspotData = await response.json() as FingerspotResponse;
      
      if (!fingerspotData.success || !fingerspotData.data || !Array.isArray(fingerspotData.data)) {
        return res.status(400).json({
          success: false,
          message: "Respons dari API Fingerspot tidak valid",
        });
      }

      // Proses data Fingerspot menggunakan command
      const result = await processFingerspotRecords(fingerspotData.data);
      
      return res.status(200).json({
        success: true,
        message: `Berhasil memproses ${result.processed} data, ${result.skipped} data dilewati`,
        processed: result.processed,
        skipped: result.skipped,
        trans_id: fingerspotData.trans_id
      });
    } catch (error: any) {
      console.error("Error mengambil dan memproses data Fingerspot:", error);
      return res.status(500).json({
        success: false,
        message: error?.message || "Error memproses data absensi",
      });
    }
  }
}

export default FingerspotController;