// pengajuan_perubahan_gaji.controller.ts
import { Request, Response } from "express";
import { PengajuanPerubahanGajiService } from "../../domain/service/pengajuan_perubahan_gaji.service";
import { QueryTypes, Transaction } from "sequelize";
import { PostgresDatabase } from "../../../../config/database.config";

const dbConn = new PostgresDatabase().dbConn;

const withRetry = async <T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    console.error(`Database operation failed: ${error.message}`);
    
    if (retries > 0 && (
      error.message.includes('Connection terminated') || 
      error.message.includes('connection') ||
      error.name === 'SequelizeConnectionError'
    )) {
      console.log(`Retrying operation, ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay);
    }
    throw error;
  }
};

// Mengambil ID (UUID), email, role, dan nip pengguna
const getUserInfo = async (id_user: string): Promise<{ id: string; email: string; role: string; nip: string }> => {
  return await withRetry(async () => {
    const [user] = await dbConn.query(
      `SELECT u.id, u.email, u.role, t.nip
       FROM users u
       LEFT JOIN teachers t ON u.id_informasi_tambahan = t.id
       WHERE u.id = :id
       LIMIT 1`,
      {
        replacements: { id: id_user },
        type: QueryTypes.SELECT,
      }
    );

    return {
      id: (user as any)?.id || "unknown_id", // Mengambil ID (UUID) pengguna
      email: (user as any)?.email || "unknown@example.com",
      role: (user as any)?.role || "unknown",
      nip: (user as any)?.nip || "unknown_user",
    };
  });
};

export class PengajuanPerubahanGajiController {
  static async ajukan(req: Request, res: Response) {
    let transaction: Transaction | undefined;
    
    try {
      transaction = await dbConn.transaction();
      
      // Mengambil ID (UUID), email, dan nip pengguna
      const { id, email, nip } = await getUserInfo(res.locals.id_user); 
      const safeNip = nip.replace(/[^a-zA-Z0-9]/g, "_");
      
      req.body._nip = safeNip; // Masih menggunakan nip untuk upload middleware

      const { tanggal, keterangan } = req.body;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const fotoBukti = files?.["foto_bukti"]?.[0];
      const fotoGaji = files?.["foto_gaji"]?.[0];

      if (!fotoBukti || !fotoGaji) {
        if (transaction) await transaction.rollback();
        return res.status(400).json({ error: "Foto bukti dan foto gaji wajib diunggah." });
      }
      
      const basePath = `uploads/${safeNip}`;
      // Meneruskan user_id (UUID) ke service
      const result = await PengajuanPerubahanGajiService.ajukanPerubahan({
        user_id: id, // Mengubah dari email ke user_id
        foto_bukti_path: `${basePath}/${fotoBukti.filename}`,
        foto_gaji_path: `${basePath}/${fotoGaji.filename}`,
        keterangan,
        tanggal,
      });
      
      if (transaction) await transaction.commit();
      
      res.status(201).json({ message: "Pengajuan berhasil disimpan", data: result });
    } catch (error: any) {
      if (transaction) await transaction.rollback();
      
      console.error("Error in ajukan:", error);
      
      res.status(500).json({
        error: "Gagal menyimpan pengajuan",
        detail: error.message,
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      // Mengambil ID (UUID), email, dan role pengguna
      const { id, email, role } = await getUserInfo(res.locals.id_user); 
      
      // Meneruskan user_id (UUID) ke service
      const result = await withRetry(() => 
        PengajuanPerubahanGajiService.getPengajuan(id, role) // Mengubah email ke id (user_id)
      );
      
      res.json({ message: "Data pengajuan ditemukan", data: result });
    } catch (error: any) {
      console.error("Error in getAll:", error);
      
      res.status(500).json({
        error: "Gagal mengambil data pengajuan",
        detail: error.message,
      });
    }
  }
  
  static async updateStatus(req: Request, res: Response) {
    let transaction: Transaction | undefined;
    
    try {
      console.log("Starting updateStatus operation for ID:", req.params.id);
      
      transaction = await dbConn.transaction();
      
      const { id } = req.params;
      const { status, rejection_reason } = req.body;
      
      console.log("Request body:", { status, rejection_reason });
      
      if (!['approved', 'rejected'].includes(status)) {
        if (transaction) await transaction.rollback();
        return res.status(400).json({ error: "Status tidak valid" });
      }
      
      if (status === 'rejected' && !rejection_reason) {
        if (transaction) await transaction.rollback();
        return res.status(400).json({ error: "Alasan penolakan wajib diisi" });
      }
      
      const { email } = await getUserInfo(res.locals.id_user); 
      console.log("User email:", email);
      
      await withRetry(() => 
        PengajuanPerubahanGajiService.updateStatus(id, {
          status,
          approved_by: email,
          rejection_reason,
        })
      , 5, 2000);
      
      if (transaction) {
        await transaction.commit();
        console.log("Transaction committed successfully");
      }
      
      res.json({ 
        message: status === 'approved' ? 
          "Pengajuan berhasil disetujui" : 
          "Pengajuan berhasil ditolak" 
      });
    } catch (error: any) {
      if (transaction) {
        try {
          await transaction.rollback();
          console.log("Transaction rolled back due to error");
        } catch (rollbackError) {
          console.error("Error during transaction rollback:", rollbackError);
        }
      }
      
      console.error("Error in updateStatus:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });
      
      res.status(500).json({
        error: "Gagal memperbarui status pengajuan",
        detail: error.message,
        suggestion: "Coba periksa koneksi database atau coba lagi nanti"
      });
    }
  }
}

export default PengajuanPerubahanGajiController;