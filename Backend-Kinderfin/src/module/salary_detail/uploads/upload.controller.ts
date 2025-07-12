import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import { QueryTypes } from "sequelize";
import fs from "fs";
import { PostgresDatabase } from "../../../config/database.config";
import calculateSalary from "../application/command/calculate-salary.command";
import { CreateLogCommand } from "../../activity_log/application/command/create-log.command";
import { SequelizeLogRepository } from "../../activity_log/infrastructure/storage/repository/sequelize-log.repository";
import { buildLogDescription } from "../../activity_log/utils/buildLogDescription";
import { middlewareAuthentication } from "../../../shared/middleware/authentication";
import * as XLSX from "xlsx";

const dbConn = new PostgresDatabase().dbConn;
const router = express.Router();

const uploadPath = path.join(__dirname,"../../../../public/uploads/salary");
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  if (file.mimetype === "text/csv" || 
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
      file.mimetype === "application/vnd.ms-excel") {
    cb(null, true);
  } else {
    cb(new Error("Hanya file CSV atau Excel yang diperbolehkan"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Validation functions
function validateAttendanceRecord(record: any) {
  const requiredFields = ['nip', 'nama', 'tanggal'];
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!record[field] || record[field].toString().trim() === '') {
      missingFields.push(field);
    }
  }
  
  // Validate time format if waktu exists
  if (record.waktu) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(record.waktu.toString().trim())) {
      missingFields.push('waktu (invalid format)');
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields,
    record: record
  };
}

function validateExcelSheet(filePath: string): { isValid: boolean; error?: string } {
  try {
    console.log('Validating Excel sheet:', filePath);
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    
    console.log('Available sheets:', sheetNames);
    
    // Check if any sheet contains "catatan" (case insensitive)
    const catatanSheet = sheetNames.find(name => name.toLowerCase().includes('catatan'));
    
    if (!catatanSheet) {
      console.log('No "catatan" sheet found. Available sheets:', sheetNames);
      return {
        isValid: false,
        error: `Gagal Memproses File. Gunakan File sesuai Format Fingerspot`
      };
    }
    
    console.log('Found catatan sheet:', catatanSheet);
    return { isValid: true };
  } catch (error: any) {
    console.error('Error validating Excel sheet:', error);
    return {
      isValid: false,
      error: `Gagal membaca file Excel: ${error.message}`
    };
  }
}

async function readExcelFile(filePath: string) {
  try {
    const workbook = XLSX.readFile(filePath);
    
    // Get sheet that contains "catatan" - already validated previously
    const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('catatan'));
    
    if (!sheetName) {
      throw new Error('Sheet catatan tidak ditemukan'); // Should not happen as it's already validated
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

    // Debug logs for sheet and period line
    console.log("Processing sheet name:", sheetName);
    console.log("DEBUG - Rows being scanned for period:", [data[0]?.[0], data[1]?.[0], data[2]?.[0]]);

    const headerRowIndex = 2; // Row 3, D3 contains date
    const dataStartIndex = 4; // Row 5, D5 contains first teacher data
    const possiblePeriodRows = data.slice(0, 10).map(row => row[2] ?? '').filter(Boolean).join(" ");
    const periodDates = [...possiblePeriodRows.matchAll(/(\d{2})\/(\d{2})\/(\d{4})/g)];

    let baseYear = "2025"; // default
    let baseMonth = "02";  // default

    console.log("Matched dates:", periodDates);

    if (periodDates.length > 0) {
      baseMonth = periodDates[0][2]; // month from first date
      baseYear = periodDates[0][3];  // year from first date
    }
    
    console.log("Base year and month:", baseYear, baseMonth);
    
    if (periodDates.length === 0) {
      console.warn("WARNING: Could not read date from period, fallback to default 02/2025");
    }

    const dates = data[headerRowIndex]?.slice(3) || []; // Column D onwards (index 3)
    const attendanceArray: any[] = [];
    const invalidRecords: any[] = [];

    for (let i = dataStartIndex; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 3) continue;
      
      const nip = String(row[0] || '').trim();
      const nama = String(row[1] || '').trim();
      
      // Skip if NIP or nama is empty
      if (!nip || !nama) continue;

      for (let j = 3; j < row.length && j - 3 < dates.length; j++) {
        const cell = row[j];
        if (!cell || typeof cell !== "string" || cell.trim() === "-") continue;

        const cellLines = cell.split("\n").map((item: string) => item.trim());
        const jam_masuk_raw = cellLines[0];
        const jam_keluar_raw = cellLines[1];
        
        const jam_masuk = jam_masuk_raw && jam_masuk_raw !== "-" ? jam_masuk_raw : null;
        const jam_keluar = jam_keluar_raw && jam_keluar_raw !== "-" ? jam_keluar_raw : null;

        if (!jam_masuk && !jam_keluar) continue;

        const day = String(dates[j - 3] || '').padStart(2, "0");
        if (!day || day === "00") continue;
        
        const tanggal = `${baseYear}-${baseMonth}-${day}`;

        const record = {
          nip,
          nama,
          tanggal,
          waktu: jam_masuk,
          jam_keluar,
        };

        // Validate record
        const validation = validateAttendanceRecord(record);
        if (validation.isValid) {
          attendanceArray.push(record);
        } else {
          invalidRecords.push({
            record,
            errors: validation.missingFields
          });
        }
      }
    }
    
    console.log(`Processed ${attendanceArray.length} valid attendance records from sheet: ${sheetName}`);
    
    if (invalidRecords.length > 0) {
      console.warn(`Found ${invalidRecords.length} invalid records:`, invalidRecords.slice(0, 5)); // Log first 5 invalid records
    }
    
    return attendanceArray;
  } catch (error: any) {
    console.error('Error reading Excel file:', error);
    throw new Error(`Gagal membaca file Excel: ${error.message}`);
  }
}

// Main upload endpoint
router.post("/", middlewareAuthentication, upload.single("file"), async (req: Request, res: Response) => {
  let filePath: string | null = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File tidak ditemukan. Gunakan key 'file'." });
    }

    filePath = path.join(uploadPath, req.file.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File tidak ditemukan di server." });
    }
    
    const fileUrl = `/uploads/salary/${req.file.filename}`;
    let result: any;

    // Process based on file type
    if (req.file.mimetype === "text/csv") {
      console.log('Processing CSV file:', req.file.originalname);
      result = await calculateSalary(filePath);
      
      if (result.processed === 0) {
        // Delete file if no data processed
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: "Tidak ada data yang berhasil diproses dari file CSV." });
      }
      
    } else if (req.file.mimetype.includes("excel")) {
      console.log('Processing Excel file:', req.file.originalname);
      
      // CRITICAL: Validate sheet before processing
      const sheetValidation = validateExcelSheet(filePath);
      
      if (!sheetValidation.isValid) {
        // Delete the uploaded file since it's invalid
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: sheetValidation.error });
      }

      // Only process if sheet is valid
      try {
        const attendanceArray = await readExcelFile(filePath);
        
        if (attendanceArray.length === 0) {
          fs.unlinkSync(filePath);
          return res.status(400).json({ error: "Tidak ada data valid yang ditemukan dalam file Excel." });
        }
        
        result = await calculateSalary(attendanceArray, "manual");
        
        if (result.processed === 0) {
          fs.unlinkSync(filePath);
          return res.status(400).json({ error: "Tidak ada data yang berhasil diproses dari file Excel." });
        }
        
      } catch (error: any) {
        // If error during processing, delete file and throw error
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw error;
      }
    }

    // Log the successful upload
    const { id_user } = res.locals;
    const [user] = await dbConn.query(
      "SELECT email FROM users WHERE id = :id LIMIT 1",
      {
        replacements: { id: id_user },
        type: QueryTypes.SELECT
      }
    );

    const logRepo = new SequelizeLogRepository();
    const createLog = new CreateLogCommand(logRepo);

    await createLog.execute({
      user_id: id_user,
      email: (user as any)?.email || 'unknown',
      action: "Upload File Presensi Gaji",
      module: "Salary Detail",
      description: buildLogDescription("Upload File Presensi Gaji", req.file.originalname),
    });

    return res.status(200).json({
      message: "File berhasil diunggah dan gaji harian berhasil diproses",
      filePath,
      fileUrl,
      processed: result?.processed || 0,
      duplicates: result?.duplicates || 0,
      errors: result?.errors || 0
    });

  } catch (error: any) {
    console.error('Error processing file:', error);
    
    // Clean up file if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    // Handle specific error types
    if (error.message?.includes("File ini sudah pernah diproses")) {
      return res.status(400).json({ error: "File ini sudah pernah diproses sebelumnya" });
    }

    if (error.message?.includes("baris duplikat")) {
      return res.status(400).json({ error: "File mengandung data fingerprint duplikat (nip + tanggal)" });
    }
    
    if (error.message?.includes("Sheet catatan tidak ditemukan")) {
      return res.status(400).json({ error: "File Excel tidak memiliki sheet yang mengandung kata 'catatan'" });
    }

    return res.status(500).json({
      error: "Gagal memproses file",
      detail: error.message,
    });
  }
});

// Error handler for multer
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: "Ukuran file terlalu besar. Maksimal 5MB." });
    }
    return res.status(400).json({ error: `Multer Error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: `Upload Error: ${err.message}` });
  }
  next();
});

// Endpoint to get list of all files in public/uploads/salary
router.get("/list-salary-files", middlewareAuthentication, async (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(uploadPath)) {
      return res.status(200).json({ files: [] });
    }
    
    const files = fs.readdirSync(uploadPath).map(filename => {
      const filePath = path.join(uploadPath, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/salary/${filename}`
      };
    }).sort((a, b) => b.created.getTime() - a.created.getTime()); // Sort by newest first
    
    res.status(200).json({ files, total: files.length });
  } catch (err: any) {
    console.error('Error reading salary files:', err);
    res.status(500).json({ error: "Gagal membaca folder salary", detail: err.message });
  }
});

// Endpoint to delete a specific salary file
router.delete("/delete/:filename", middlewareAuthentication, async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadPath, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File tidak ditemukan" });
    }
    
    fs.unlinkSync(filePath);
    
    // Log the deletion
    const { id_user } = res.locals;
    const [user] = await dbConn.query(
      "SELECT email FROM users WHERE id = :id LIMIT 1",
      {
        replacements: { id: id_user },
        type: QueryTypes.SELECT
      }
    );

    const logRepo = new SequelizeLogRepository();
    const createLog = new CreateLogCommand(logRepo);

    await createLog.execute({
      user_id: id_user,
      email: (user as any)?.email || 'unknown',
      action: "Delete File Presensi Gaji",
      module: "Salary Detail",
      description: buildLogDescription("Delete File Presensi Gaji", filename),
    });
    
    res.status(200).json({ message: "File berhasil dihapus", filename });
  } catch (err: any) {
    console.error('Error deleting salary file:', err);
    res.status(500).json({ error: "Gagal menghapus file", detail: err.message });
  }
});

export default router;