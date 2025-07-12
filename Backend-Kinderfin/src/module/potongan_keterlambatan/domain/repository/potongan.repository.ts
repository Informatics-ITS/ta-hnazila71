import { PotonganKeterlambatan } from "../entity/potongan.entity";

export interface PotonganRepository {
  findAll(): Promise<PotonganKeterlambatan[]>;

  findById(id: string): Promise<PotonganKeterlambatan | null>;

  findByJabatan(jabatan: string): Promise<PotonganKeterlambatan[]>;

  findBestPotongan(jabatan: string, jenis_potongan: string, menit: number): Promise<PotonganKeterlambatan | null>;

  create(data: {
    jabatan: string;
    urutan_gaji_dipotong: number;
    persen_potong: number;
    batas_menit: number;
    jenis_potongan: string; 
  }): Promise<PotonganKeterlambatan>;

  update(id: string, data: Partial<PotonganKeterlambatan>): Promise<void>;

  delete(id: string): Promise<void>;
  deleteByUrutanGaji(urutan: number): Promise<void>;

  findByJabatanAndBatas(
    jabatan: string,
    batas_menit: number,
    jenis_potongan: string,
    urutan_gaji_dipotong: number
  ): Promise<PotonganKeterlambatan | null>;
}
