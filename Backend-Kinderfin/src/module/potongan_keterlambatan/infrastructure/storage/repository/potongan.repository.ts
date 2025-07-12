import { PotonganRepository } from "../../../domain/repository/potongan.repository";
import { PotonganKeterlambatan } from "../../../domain/entity/potongan.entity";
import { QueryTypes } from "sequelize";
import { PostgresDatabase } from "../../../../../config/database.config";

const dbConn = new PostgresDatabase().dbConn;

export class SequelizePotonganRepository implements PotonganRepository {
  async findAll() {
    return await PotonganKeterlambatan.findAll();
  }

  async findById(id: string) {
    return await PotonganKeterlambatan.findByPk(id);
  }

  async findByJabatan(jabatan: string) {
    return await PotonganKeterlambatan.findAll({ where: { jabatan } });
  }

  async findByJabatanAndBatas(
    jabatan: string,
    batas_menit: number,
    jenis_potongan: string,
    urutan_gaji_dipotong: number
  ) {
    return await PotonganKeterlambatan.findOne({
      where: { jabatan, batas_menit, jenis_potongan, urutan_gaji_dipotong }
    });
  }

  async create(data: {
    jabatan: string;
    urutan_gaji_dipotong: number;
    persen_potong: number;
    batas_menit: number;
    jenis_potongan: string;
  }) {
    return await PotonganKeterlambatan.create(data);
  }

  async update(id: string, data: Partial<PotonganKeterlambatan>) {
    await PotonganKeterlambatan.update(data, { where: { id } });
  }

  async delete(id: string) {
    await PotonganKeterlambatan.destroy({ where: { id } });
  }

  // Tambahkan implementasi fungsi baru di sini
  async deleteByUrutanGaji(urutan: number): Promise<void> {
    await PotonganKeterlambatan.destroy({
      where: { urutan_gaji_dipotong: urutan },
    });
    console.log(`[SequelizePotonganRepository] Semua potongan dengan urutan gaji ${urutan} telah dihapus.`);
  }

  async findBestPotongan(
    jabatan: string,
    jenis_potongan: string,
    menit: number
  ): Promise<PotonganKeterlambatan | null> {
    const query = `
      SELECT *
      FROM potongan_keterlambatan
      WHERE jabatan = :jabatan
        AND jenis_potongan = :jenis_potongan
        AND batas_menit <= :menit
      ORDER BY batas_menit DESC
      LIMIT 1;
    `;

    const result = await dbConn.query<PotonganKeterlambatan>(query, {
      replacements: { jabatan, jenis_potongan, menit },
      type: QueryTypes.SELECT,
    });

    return result[0] || null;
  }
}