// pengajuan_perubahan_gaji.repository.ts
import { QueryTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config/database.config";
import PengajuanPerubahanGaji from "../../domain/entity/pengajuan_perubahan_gaji.entity";
import { UserModel } from '../../../user/infrastructure/migration/user-table'; // Import UserModel untuk lookup

const dbConn = new PostgresDatabase().dbConn;

class PengajuanPerubahanGajiRepository {
  static async updateStatus(
    id: string,
    data: {
      status: 'approved' | 'rejected';
      approved_by: string;
      rejection_reason?: string;
    }
  ) {
    const { status, approved_by, rejection_reason } = data;
    const approved_at = status === 'approved' ? new Date() : null;
    
    return await PengajuanPerubahanGaji.update(
      { 
        status,
        approved_by,
        approved_at,
        rejection_reason: status === 'rejected' ? rejection_reason : null
      },
      { where: { id } }
    );
  }
  
  static async getById(id: string): Promise<any> {
    const result = await dbConn.query(
      "SELECT * FROM pengajuan_perubahan_gaji WHERE id = :id",
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );
    return result[0] || null;
  }
  
  static async createPengajuan(data: {
    user_id: string; 
    foto_bukti_path: string;
    foto_gaji_path: string;
    keterangan: string;
    tanggal: string;
  }) {
    return await PengajuanPerubahanGaji.create(data);
  }

  static async getAll(): Promise<any[]> {
    const result = await dbConn.query(
      "SELECT * FROM pengajuan_perubahan_gaji ORDER BY created_at DESC",
      { type: QueryTypes.SELECT }
    );
    return result as any[];
  }

  static async getByUserId(user_id: string): Promise<any[]> {
    const result = await dbConn.query(
      "SELECT * FROM pengajuan_perubahan_gaji WHERE user_id = ? ORDER BY created_at DESC", 
      {
        replacements: [user_id],
        type: QueryTypes.SELECT,
      }
    );
    return result as any[];
  }
}

export default PengajuanPerubahanGajiRepository;