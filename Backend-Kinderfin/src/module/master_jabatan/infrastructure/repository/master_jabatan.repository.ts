// master_jabatan/infrastructure/repository/master_jabatan.repository.ts
// KODE LENGKAP SETELAH DIROMBAK

import MasterJabatan from "../../domain/entity/master_jabatan.entity";

export class MasterJabatanRepository {
  async getAll() {
    return await MasterJabatan.findAll();
  }

  async getByJabatan(jabatan: string) {
    return await MasterJabatan.findOne({ where: { jabatan } });
  }

  async findByName(jabatan: string) {
    return await MasterJabatan.findOne({ where: { jabatan } });
  }

  /**
   * Metode ini sekarang HANYA membuat entri di master_jabatan.
   * Logika sinkronisasi dipindahkan ke controller/service.
   */
  async create(data: any, options?: { transaction: any }) {
    if (!data.jabatan) {
      throw new Error("Jabatan tidak boleh kosong.");
    }

    const payload = {
      jabatan: data.jabatan,
      gaji1: data.gaji1 ?? 0,
      gaji2: data.gaji2 ?? 0,
      gaji3: data.gaji3 ?? 0,
      gaji4: data.gaji4 ?? 0,
      gaji5: data.gaji5 ?? 0,
      gaji6: data.gaji6 ?? 0,
      gaji7: data.gaji7 ?? 0,
      gaji8: data.gaji8 ?? 0,
      gaji9: data.gaji9 ?? 0,
      gaji10: data.gaji10 ?? 0,
    };
    
    // Gunakan options untuk meneruskan transaksi
    return await MasterJabatan.create(payload, options);
  }

  /**
   * Metode update sekarang hanya mengupdate tabelnya sendiri.
   * Logika update ke tabel lain dipindahkan ke controller/service.
   */
  async update(jabatan: string, data: Partial<MasterJabatan>, options?: { transaction: any }) {
    const record = await MasterJabatan.findOne({ where: { jabatan }, raw: false });
    if (!record) throw new Error("Jabatan harian tidak ditemukan untuk diupdate.");
  
    // Gunakan options untuk meneruskan transaksi
    return await record.update(data, options);
  }
  
  /**
   * Metode delete sekarang hanya menghapus dari tabelnya sendiri.
   */
  async delete(jabatan: string, options?: { transaction: any }) {
    const count = await MasterJabatan.destroy({ where: { jabatan }, ...options });
    // Dihapus pengecekan error agar bisa dipanggil dalam transaksi penghapusan gabungan
    return count;
  }

  async getTeachersWithSalary() {
    try {
      const data = await MasterJabatan.findAll({
        attributes: ["jabatan", "gaji1", "gaji2", "gaji3", "gaji4", "gaji5", "gaji6", "gaji7", "gaji8", "gaji9", "gaji10"],
        where: { jabatan: "Guru" }
      });
      return data;
    } catch (error) {
      console.error("Error saat mengambil data gaji guru:", error);
      throw new Error("Gagal mengambil data gaji guru.");
    }
  }

  async resetFieldToZero(field: string) {
    try {
      if (!field) throw new Error("Field harus disediakan.");
      await MasterJabatan.update(
        { [field]: 0 },
        { where: {}, silent: true }
      );
    } catch (error) {
      console.error(`Error saat reset field '${field}' ke 0:`, error);
      throw new Error("Gagal mereset field ke 0.");
    }
  }
}

export default new MasterJabatanRepository();