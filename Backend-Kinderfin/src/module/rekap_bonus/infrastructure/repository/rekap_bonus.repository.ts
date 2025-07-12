import RekapBonus from "../../domain/entity/rekap_bonus.entity";
import { GuruModel } from "../../../user/infrastructure/migration/guru-table";

export class RekapBonusRepository {
  async create(data: {
    tanggal: string;
    start_date: string;
    end_date: string;
    nip: string;
    uang_tambahan?: number;
    keterangan?: string | null;
  }) {
    try {
      if (!data.tanggal || !data.start_date || !data.end_date || !data.nip) {
        throw new Error("Semua data (tanggal, start_date, end_date, nip) harus diisi.");
      }

      // 1. Cari teacher_id berdasarkan nip
      // Menggunakan konversi ke 'unknown' terlebih dahulu
      const teacher = await GuruModel.findOne({ where: { nip: data.nip } }) as unknown as { id: string | null };
      
      if (!teacher || !teacher.id) {
        throw new Error(`Guru dengan NIP '${data.nip}' tidak ditemukan atau tidak memiliki ID.`);
      }
      const teacherId = teacher.id;

      const newRekap = await RekapBonus.create({
        tanggal: data.tanggal,
        start_date: data.start_date,
        end_date: data.end_date,
        teacher_id: teacherId,
        uang_tambahan: data.uang_tambahan ?? 0,
        keterangan: data.keterangan ?? null
      });

      console.log(`Rekap bonus untuk NIP '${data.nip}' (Teacher ID: '${teacherId}') pada tanggal '${data.tanggal}') berhasil dibuat.`);
      return newRekap;
    } catch (error) {
      console.error("Error saat membuat rekap bonus:", error);
      if (error instanceof Error) throw new Error(error.message);
      throw new Error("Terjadi kesalahan saat menyimpan rekap bonus.");
    }
  }

  async findByNip(nip: string) {
    try {
      // 1. Cari teacher_id berdasarkan nip
      // Menggunakan konversi ke 'unknown' terlebih dahulu
      const teacher = await GuruModel.findOne({ where: { nip } }) as unknown as { id: string | null };
      
      if (!teacher || !teacher.id) {
        console.log(`Guru dengan NIP '${nip}' tidak ditemukan atau tidak memiliki ID.`);
        return [];
      }
      const teacherId = teacher.id;

      const records = await RekapBonus.findAll({
        where: { teacher_id: teacherId },
        order: [["tanggal", "ASC"]]
      });

      if (!records.length) {
        console.log(`Tidak ditemukan data rekap untuk Teacher ID '${teacherId}' (NIP: '${nip}').`);
        return [];
      }

      console.log(`Ditemukan ${records.length} data rekap untuk Teacher ID '${teacherId}' (NIP: '${nip}').`);
      return records;
    } catch (error) {
      console.error("Error saat mengambil rekap bonus berdasarkan NIP:", error);
      throw new Error("Gagal mengambil data rekap bonus.");
    }
  }
}

export default new RekapBonusRepository();