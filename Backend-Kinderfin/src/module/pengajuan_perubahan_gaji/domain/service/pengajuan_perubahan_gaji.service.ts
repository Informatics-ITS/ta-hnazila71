// pengajuan_perubahan_gaji.service.ts
import PengajuanPerubahanGajiRepository from "../../infrastructure/repository/pengajuan_perubahan_gaji.repository";
import { UserModel } from '../../../user/infrastructure/migration/user-table'; 

export class PengajuanPerubahanGajiService {
  static async updateStatus(
    id: string,
    data: {
      status: 'approved' | 'rejected';
      approved_by: string;
      rejection_reason?: string;
    }
  ) {
    const pengajuan = await PengajuanPerubahanGajiRepository.getById(id);
    
    if (!pengajuan) {
      throw new Error("Pengajuan tidak ditemukan");
    }
    
    return await PengajuanPerubahanGajiRepository.updateStatus(id, data);
  }

  // ajukanPerubahan sekarang menerima user_id (UUID)
  static async ajukanPerubahan({
    user_id, // Mengubah dari email ke user_id
    foto_bukti_path,
    foto_gaji_path,
    keterangan,
    tanggal,
  }: {
    user_id: string; // Tipe data menjadi string (UUID)
    foto_bukti_path: string;
    foto_gaji_path: string;
    keterangan: string;
    tanggal: string;
  }) {
    return await PengajuanPerubahanGajiRepository.createPengajuan({
      user_id, // Meneruskan user_id
      foto_bukti_path,
      foto_gaji_path,
      keterangan,
      tanggal,
    });
  }

  // getPengajuan sekarang menerima user_id (UUID)
  static async getPengajuan(user_id: string, role: string) { // Mengubah email ke user_id
    const roleLower = role.toLowerCase();
    const allowedSeeAll = ["admin", "kepala sekolah", "bendahara"];
  
    if (allowedSeeAll.includes(roleLower)) {
      return await PengajuanPerubahanGajiRepository.getAll();
    } else {
      return await PengajuanPerubahanGajiRepository.getByUserId(user_id); // Menggunakan getByUserId
    }
  }
}