import MasterJabatanRepository from "../../infrastructure/repository/master_jabatan.repository";
import MasterJabatanPokokRepository from "../../infrastructure/repository/master_jabatan_pokok.repository";

export class JabatanSyncService {
  async syncToPokok(jabatan: string) {
    const exists = await MasterJabatanPokokRepository.findByName(jabatan);
    if (!exists) {
      await MasterJabatanPokokRepository.create({ jabatan });
    }
  }

  async syncToHarian(jabatan: string) {
    const exists = await MasterJabatanRepository.findByName(jabatan);
    if (!exists) {
      await MasterJabatanRepository.create({ jabatan });
    }
  }

  async deleteFromPokok(jabatan: string) {
    const exists = await MasterJabatanPokokRepository.findByName(jabatan);
    if (exists) {
      await MasterJabatanPokokRepository.delete(jabatan);
    }
  }
}

export default new JabatanSyncService();