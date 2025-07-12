import { QueryTypes } from "sequelize";
import { PotonganRepository } from "../../domain/repository/potongan.repository";
import { PostgresDatabase } from "../../../../config/database.config";

const dbConn = new PostgresDatabase().dbConn;

export class CreatePotonganCommand {
  constructor(private potonganRepo: PotonganRepository) {}

  async execute(data: {
    jabatan: string;
    urutan_gaji_dipotong: number;
    persen_potong: number;
    batas_menit: number; 
    jenis_potongan: string; 
  }) {
    const { jabatan, urutan_gaji_dipotong, persen_potong, batas_menit, jenis_potongan } = data;

    // Validasi ke master_jabatan (query langsung)
    const [result] = await dbConn.query(
      `SELECT * FROM master_jabatan WHERE jabatan = :jabatan LIMIT 1`,
      {
        replacements: { jabatan },
        type: QueryTypes.SELECT,
      }
    );

    if (!result) {
      throw new Error("Jabatan tidak ditemukan di master_jabatan");
    }

    // Validate jenis_potongan
    const allowedJenisPotongan = [
      "datang_telat",
      "pulang_cepat",
      "tidak_absen_masuk",
      "tidak_absen_pulang"
    ];

    if (!allowedJenisPotongan.includes(jenis_potongan)) {
      throw new Error("Jenis potongan tidak valid. Harus salah satu dari: " + allowedJenisPotongan.join(", "));
    }

    // Cegah duplikasi berdasarkan jabatan + urutan_gaji_dipotong + jenis_potongan
    // const [existing] = await dbConn.query(
    //   `SELECT * FROM potongan_keterlambatan 
    //    WHERE jabatan = :jabatan 
    //      AND urutan_gaji_dipotong = :urutan_gaji_dipotong 
    //      AND jenis_potongan = :jenis_potongan 
    //    LIMIT 1`,
    //   {
    //     replacements: { jabatan, urutan_gaji_dipotong, jenis_potongan },
    //     type: QueryTypes.SELECT,
    //   }
    // );

    // if (existing) {
    //   throw new Error("Potongan dengan jabatan, urutan gaji dipotong, dan jenis potongan ini sudah ada.");
    // }

    // Simpan ke tabel potongan
    const potongan = await this.potonganRepo.create({
      jabatan,
      urutan_gaji_dipotong,
      persen_potong,
      batas_menit, 
      jenis_potongan, 
    });

    return potongan;
  }
}