import PengaturanGajiAktifRepository from "../../infrastructure/repository/pengaturan_gaji_aktif.repository";
import MasterJabatanRepository from "../../../master_jabatan/infrastructure/repository/master_jabatan.repository";
import MasterJabatanPokokRepository from "../../../master_jabatan/infrastructure/repository/master_jabatan_pokok.repository";
// 1. Import repository potongan
import { SequelizePotonganRepository } from "../../../potongan_keterlambatan/infrastructure/storage/repository/potongan.repository";


interface FieldAktif {
  field: string;
  label?: string;
  type?: "harian" | "pokok"; 
}

export class SavePengaturanGajiAktifCommand {
  async execute(fields: FieldAktif[]): Promise<void> {
    if (!Array.isArray(fields)) {
      throw new Error("Data pengaturan harus berupa array.");
    }

    for (const item of fields) {
      if (!item.field || typeof item.field !== "string") {
        throw new Error("Setiap item wajib memiliki 'field' bertipe string.");
      }
      if (item.type && !["harian", "pokok"].includes(item.type)) {
        throw new Error(`Type '${item.type}' tidak valid. Hanya boleh 'harian' atau 'pokok'.`);
      }
    }

    await PengaturanGajiAktifRepository.save(fields);
  }
}

export class DeletePengaturanGajiAktifCommand {
  static async execute(field: string): Promise<void> {
    if (!field || typeof field !== "string") {
      throw new Error("Field yang akan dihapus harus disediakan dan bertipe string.");
    }

    
    await PengaturanGajiAktifRepository.deleteByField(field);
    await MasterJabatanRepository.resetFieldToZero(field);
    await MasterJabatanPokokRepository.resetFieldToZero(field);


    const match = field.match(/\d+$/);
    if (match) {
      const urutanGaji = parseInt(match[0], 10);

      // 3. Buat instance repository potongan dan panggil fungsi hapus
      const potonganRepo = new SequelizePotonganRepository();
      await potonganRepo.deleteByUrutanGaji(urutanGaji);
    }
  
  }
}

export const savePengaturanGajiAktifCommand = new SavePengaturanGajiAktifCommand();
export const deletePengaturanGajiAktifCommand = DeletePengaturanGajiAktifCommand;