// master_jabatan/infrastructure/repository/master_jabatan_pokok.repository.ts
// KODE LENGKAP SETELAH DIROMBAK

import MasterJabatanPokok from "../../domain/entity/master_jabatan_pokok.entity";

export class MasterJabatanPokokRepository {
  async findByName(jabatan: string) {
    return await MasterJabatanPokok.findOne({ where: { jabatan } });
  }

  /**
   * Metode ini sekarang HANYA membuat entri di master_jabatan_pokok.
   * Logika untuk membuat data di tabel master_jabatan (harian) dipindahkan ke controller/service
   * untuk memastikan urutan yang benar di dalam transaksi.
   */
  async create(data: any, options?: { transaction: any }) {
    if (!data.jabatan) throw new Error("Jabatan tidak boleh kosong.");

    const payload = {
      jabatan: data.jabatan,
      gaji_pokok1: data.gaji_pokok1 ?? 0,
      gaji_pokok2: data.gaji_pokok2 ?? 0,
      gaji_pokok3: data.gaji_pokok3 ?? 0,
      gaji_pokok4: data.gaji_pokok4 ?? 0,
      gaji_pokok5: data.gaji_pokok5 ?? 0,
      gaji_pokok6: data.gaji_pokok6 ?? 0,
      gaji_pokok7: data.gaji_pokok7 ?? 0,
      gaji_pokok8: data.gaji_pokok8 ?? 0,
      gaji_pokok9: data.gaji_pokok9 ?? 0,
      gaji_pokok10: data.gaji_pokok10 ?? 0,
    };
    
    // Gunakan options untuk meneruskan transaksi
    return await MasterJabatanPokok.create(payload, options);
  }

  async update(jabatan: string, data: Partial<MasterJabatanPokok>, options?: { transaction: any }) {
    const record = await MasterJabatanPokok.findOne({ where: { jabatan }, raw: false });
    if (!record) throw new Error("Jabatan pokok tidak ditemukan untuk diupdate.");

    // Gunakan options untuk meneruskan transaksi
    return await record.update(data, { ...options, silent: true });
  }
  
  async resetFieldToZero(field: string) {
    try {
      if (!field) {
        throw new Error("Field harus disediakan.");
      }
      await MasterJabatanPokok.update(
        { [field]: 0 },
        { where: {}, silent: true }
      );
      console.log(`Semua nilai di field '${field}' berhasil di-set ke 0 di tabel master_jabatan_pokok.`);
    } catch (error) {
      console.error(`Error saat reset field '${field}' ke 0 (gaji pokok):`, error);
      throw new Error("Gagal mereset field gaji pokok ke 0.");
    }
  }

  async delete(jabatan: string, options?: { transaction: any }) {
    const count = await MasterJabatanPokok.destroy({ where: { jabatan }, ...options });
    // Dihapus pengecekan error agar bisa dipanggil dalam transaksi penghapusan gabungan tanpa error jika salah satu tidak ada
    return count;
  }

  async getAll() {
    return await MasterJabatanPokok.findAll();
  }
}

export default new MasterJabatanPokokRepository();