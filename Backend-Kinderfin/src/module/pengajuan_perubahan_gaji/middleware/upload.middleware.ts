import multer from "multer";
import fs from "fs";
import path from "path";
import { Request } from "express";

// Buat folder jika belum ada
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Sanitasi NIP agar aman dijadikan nama folder
const sanitizeNip = (nip: string) => {
  return nip.replace(/[^a-zA-Z0-9]/g, "_");
};

// Konfigurasi penyimpanan file di public/uploads
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const rawNip = (req as any).res?.locals?._nip || "unknown_user";
    const safeNip = sanitizeNip(rawNip);

    const folder = path.join(process.cwd(), "public", "uploads", safeNip);
    ensureDir(folder);
    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const prefix = file.fieldname === "foto_bukti" ? "bukti" : "gaji";
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s+/g, "_");
    const fileName = `${prefix}-${timestamp}-${originalName}`;
    cb(null, fileName);
  },
});

// Filter hanya izinkan file gambar
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Hanya file gambar yang diperbolehkan (jpg, jpeg, png)"));
  }
  cb(null, true);
};

// Export multer instance
export const uploadPengajuan = multer({
  storage,
  fileFilter,
});
