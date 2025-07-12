import PengaturanGajiAktifRepository from "../../infrastructure/repository/pengaturan_gaji_aktif.repository";

interface FieldAktif {
  field: string;
  label: string | null;
  type: string | null; 
}

export class GetPengaturanGajiAktifQuery {
  async execute(): Promise<FieldAktif[]> { 
    return await PengaturanGajiAktifRepository.getAll();
  }
}

export default new GetPengaturanGajiAktifQuery();
