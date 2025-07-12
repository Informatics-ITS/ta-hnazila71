import MasterJabatanRepository from "../../infrastructure/repository/master_jabatan.repository";

export class MasterJabatanService {
  async getAllJabatan() {
    return await MasterJabatanRepository.getAll();
  }

  async getJabatanByJabatan(jabatan: string) {
    return await MasterJabatanRepository.getByJabatan(jabatan);
  }  

  async createJabatan(data: any) {
    return await MasterJabatanRepository.create(data);
  }

  async updateJabatan(jabatan: string, data: any) {
    return await MasterJabatanRepository.update(jabatan, data);
  }

  async deleteJabatan(jabatan: string) {
    return await MasterJabatanRepository.delete(jabatan);
  }
}

export default new MasterJabatanService();