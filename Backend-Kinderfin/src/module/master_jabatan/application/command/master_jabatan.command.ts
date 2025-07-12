import MasterJabatanService from "../../domain/service/master_jabatan.service";
import MasterJabatanRepository from "../../infrastructure/repository/master_jabatan.repository";
import JabatanSyncService from "../../domain/service/sync_jabatan.service";

export class CreateMasterJabatanCommand {
  async execute(data: any) {
    const existing = await MasterJabatanRepository.findByName(data.jabatan);
    if (existing) {
      throw new Error(`Jabatan '${data.jabatan}' sudah ada.`);
    }
    return await MasterJabatanService.createJabatan(data);
  }
}

export class UpdateMasterJabatanCommand {
  async execute(jabatan: string, data: any) {
    const existing = await MasterJabatanRepository.findByName(jabatan);
    if (!existing) {
      throw new Error(`Jabatan '${jabatan}' tidak ditemukan.`);
    }
    return await MasterJabatanService.updateJabatan(jabatan, data);
  }
}

export class DeleteMasterJabatanCommand {
  async execute(jabatan: string) {
    const existing = await MasterJabatanRepository.findByName(jabatan);
    if (!existing) {
      throw new Error(`Jabatan '${jabatan}' tidak ditemukan.`);
    }
    await MasterJabatanService.deleteJabatan(jabatan);
    await JabatanSyncService.deleteFromPokok(jabatan);
  }
}

export default {
  CreateMasterJabatanCommand: new CreateMasterJabatanCommand(),
  UpdateMasterJabatanCommand: new UpdateMasterJabatanCommand(),
  DeleteMasterJabatanCommand: new DeleteMasterJabatanCommand(),
};
