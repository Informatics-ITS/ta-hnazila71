import { QueryTypes, DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config/database.config";
import SalaryDetail from "../../domain/entity/salary_detail.entity";
import { STANDARD_CHECK_OUT } from "../../../../config/constants";
import { STANDARD_CHECK_IN } from "../../../../config/constants"; // Diperlukan untuk kalkulasi ulang

const dbConn = new PostgresDatabase().dbConn;

// Helper function untuk kalkulasi menit (bisa di-refactor ke file terpisah)
async function calculateLatenessMinutes(checkInTime: string): Promise<number> {
    const [hours, minutes] = checkInTime.split(":").map(Number);
    const [stdHours, stdMinutes] = STANDARD_CHECK_IN.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    const standardMinutes = stdHours * 60 + stdMinutes;
    return totalMinutes > standardMinutes ? totalMinutes - standardMinutes : 0;
}

function calculateEarlyLeaveMinutes(checkOutTime: string): number {
    const [hours, minutes] = checkOutTime.split(":").map(Number);
    const [stdHours, stdMinutes] = STANDARD_CHECK_OUT.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    const standardMinutes = stdHours * 60 + stdMinutes;
    return totalMinutes < standardMinutes ? standardMinutes - totalMinutes : 0;
}


const UploadedFileHash = dbConn.define("uploaded_file_hashes", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  hash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "uploaded_file_hashes",
  timestamps: false,
});

interface SalaryDetailRecord {
  id: string;
  teacher_id: string;
  tanggal: string;
  [key: string]: any;
}

interface PotonganKeterlambatan {
    batas_menit: number;
    persen_potong: number;
    urutan_gaji_dipotong: number;
    jabatan: string;
    jenis_potongan: string;
}

class SalaryDetailRepository {
  static async getTeacherById(teacherId: string): Promise<{ id: string; nama_lengkap: string; jabatan: string } | null> {
    const result = await dbConn.query(
      "SELECT * FROM teachers WHERE id = ?",
      { replacements: [teacherId], type: QueryTypes.SELECT }
    );
    return result[0] as any ?? null;
  }

  static async getTeacherByNip(nip: string): Promise<{ id: string; nama_lengkap: string; jabatan: string } | null> {
    if (!nip || typeof nip !== "string" || nip.trim() === "") {
      console.warn("NIP kosong atau tidak valid, skip.");
      return null;
    }

    const result = await dbConn.query(
      "SELECT * FROM teachers WHERE nip = ?",
      { replacements: [nip], type: QueryTypes.SELECT }
    );

    if (!result.length) {
      console.warn(`Guru dengan NIP '${nip}' tidak ditemukan.`);
      return null;
    }

    return result[0] as any;
  }

  static async safeGetTeacherByNip(nip: string): Promise<{ id: string; nama_lengkap: string; jabatan: string } | null> {
    if (!nip || typeof nip !== "string" || nip.trim() === "") {
      console.warn("NIP kosong atau tidak valid, skip.");
      return null;
    }

    const result = await dbConn.query(
      "SELECT * FROM teachers WHERE nip = ?",
      { replacements: [nip], type: QueryTypes.SELECT }
    );

    if (!result.length) {
      console.warn(`Guru dengan NIP '${nip}' tidak ditemukan, skip.`);
      return null;
    }

    return result[0] as any;
  }

  static async getSalaryComponentsByJabatan(jabatan: string): Promise<Record<string, number> | null> {
    const result = await dbConn.query(
      "SELECT * FROM master_jabatan WHERE jabatan = ?",
      { replacements: [jabatan], type: QueryTypes.SELECT }
    );
    return result[0] as any ?? null;
  }

  static async saveSalaryDetail(salaryData: Record<string, any>): Promise<void> {
    await SalaryDetail.create(salaryData);
  }

  static async updateJamKeluar(nip: string, tanggal: string, jam_keluar: string): Promise<void> {
    if (!nip || typeof nip !== "string" || nip.trim() === "") {
      console.warn("NIP kosong atau tidak valid.");
      return;
    }
    const teacher = await this.getTeacherByNip(nip);
    if (!teacher?.id) {
      console.warn("Guru tidak ditemukan");
      return;
    }

    const existingSalaryResult = await dbConn.query(
      "SELECT * FROM detail_salary WHERE teacher_id = ? AND tanggal = ?",
      { replacements: [teacher.id, tanggal], type: QueryTypes.SELECT }
    );

    if (!existingSalaryResult.length) return;
    const existingSalary = existingSalaryResult[0] as any;

    // 1. Ambil kembali komponen gaji dasar dari master
    const salaryComponents = await this.getSalaryComponentsByJabatan(teacher.jabatan);
    if (!salaryComponents) {
      console.warn("Komponen gaji master tidak ditemukan untuk jabatan:", teacher.jabatan);
      return;
    }

    const gaji: Record<string, number> = {};
    for (let i = 1; i <= 10; i++) {
      gaji[`gaji${i}final`] = salaryComponents[`gaji${i}`] ?? 0;
    }

    // 2. Terapkan kembali potongan datang telat yang sudah ada (jika ada)
    const terlambat_menit = existingSalary.jam_masuk ? await calculateLatenessMinutes(existingSalary.jam_masuk) : 0;
    
    if (terlambat_menit > 0) {
        const potonganTelatRules = await dbConn.query<PotonganKeterlambatan>(`
            SELECT * FROM potongan_keterlambatan WHERE jabatan = :jabatan AND jenis_potongan = 'datang_telat'
        `, { replacements: { jabatan: teacher.jabatan }, type: QueryTypes.SELECT });

        const bestPerUrutanTelat = new Map<number, PotonganKeterlambatan>();
        for (const p of potonganTelatRules) {
            if (terlambat_menit >= p.batas_menit) {
                const existing = bestPerUrutanTelat.get(p.urutan_gaji_dipotong);
                if (!existing || p.batas_menit > existing.batas_menit) {
                    bestPerUrutanTelat.set(p.urutan_gaji_dipotong, p);
                }
            }
        }
        for (const [urutan, potongan] of bestPerUrutanTelat) {
            const key = `gaji${urutan}final`;
            const nilaiPotong = Math.floor((gaji[key] || 0) * (potongan.persen_potong / 100));
            gaji[key] -= nilaiPotong;
        }
    }
    
    // 3. Hitung dan terapkan potongan pulang cepat yang BARU
    const pulangCepatMenit = calculateEarlyLeaveMinutes(jam_keluar);
    let potongan_pulang_cepat = 0;

    if (pulangCepatMenit > 0) {
        const potonganCepatRules = await dbConn.query<PotonganKeterlambatan>(`
            SELECT * FROM potongan_keterlambatan WHERE jabatan = :jabatan AND jenis_potongan = 'pulang_cepat'
        `, { replacements: { jabatan: teacher.jabatan }, type: QueryTypes.SELECT });

        const bestPerUrutanCepat = new Map<number, PotonganKeterlambatan>();
        for (const p of potonganCepatRules) {
            if (pulangCepatMenit >= p.batas_menit) {
                const existing = bestPerUrutanCepat.get(p.urutan_gaji_dipotong);
                if (!existing || p.batas_menit > existing.batas_menit) {
                    bestPerUrutanCepat.set(p.urutan_gaji_dipotong, p);
                }
            }
        }

        for (const [urutan, potongan] of bestPerUrutanCepat) {
            const key = `gaji${urutan}final`;
            const nilaiPotong = Math.floor((gaji[key] || 0) * (potongan.persen_potong / 100));
            potongan_pulang_cepat += nilaiPotong;
            gaji[key] -= nilaiPotong;
        }
    }

    // 4. Hitung total salary bersih yang baru
    const total_salary = Object.values(gaji).reduce((sum, current) => sum + current, 0);

    // 5. Update record di database dengan semua nilai baru
    await dbConn.query(
        `
        UPDATE detail_salary
        SET jam_keluar = ?,
            potongan_pulang_cepat = ?,
            potongan_tidak_absen_pulang = 0, -- Set 0 karena sudah absen pulang
            gaji1final = ?, gaji2final = ?, gaji3final = ?, gaji4final = ?, gaji5final = ?,
            gaji6final = ?, gaji7final = ?, gaji8final = ?, gaji9final = ?, gaji10final = ?,
            total_salary = ?
        WHERE teacher_id = ? AND tanggal = ?
        `,
        {
            replacements: [
                jam_keluar,
                potongan_pulang_cepat,
                gaji.gaji1final || 0, gaji.gaji2final || 0, gaji.gaji3final || 0,
                gaji.gaji4final || 0, gaji.gaji5final || 0, gaji.gaji6final || 0,
                gaji.gaji7final || 0, gaji.gaji8final || 0, gaji.gaji9final || 0,
                gaji.gaji10final || 0,
                Math.max(0, total_salary),
                teacher.id,
                tanggal
            ],
            type: QueryTypes.UPDATE,
        }
    );
  }

  static async saveOrUpdateSalaryDetail(salaryData: Record<string, any>) {
    const { teacher_id, tanggal, jam_masuk, jam_keluar } = salaryData;

    const existing = await dbConn.query(
      "SELECT * FROM detail_salary WHERE teacher_id = ? AND tanggal = ?",
      { replacements: [teacher_id, tanggal], type: QueryTypes.SELECT }
    );

    const total_salary = salaryData.total_salary;

    if (existing.length) {
      await dbConn.query(
        `
        UPDATE detail_salary
        SET jam_masuk = COALESCE(?, jam_masuk),
            jam_keluar = COALESCE(?, jam_keluar),
            potongan_datang_telat = ?,
            potongan_pulang_cepat = ?,
            potongan_tidak_absen_masuk = ?,
            potongan_tidak_absen_pulang = ?,
            gaji1final = ?, gaji2final = ?, gaji3final = ?, gaji4final = ?, gaji5final = ?,
            gaji6final = ?, gaji7final = ?, gaji8final = ?, gaji9final = ?, gaji10final = ?,
            total_salary = ?
        WHERE teacher_id = ? AND tanggal = ?
        `,
        {
          replacements: [
            jam_masuk,
            jam_keluar,
            salaryData.potongan_datang_telat || 0,
            salaryData.potongan_pulang_cepat || 0,
            salaryData.potongan_tidak_absen_masuk || 0,
            salaryData.potongan_tidak_absen_pulang || 0,
            salaryData.gaji1final || 0, salaryData.gaji2final || 0, salaryData.gaji3final || 0,
            salaryData.gaji4final || 0, salaryData.gaji5final || 0, salaryData.gaji6final || 0,
            salaryData.gaji7final || 0, salaryData.gaji8final || 0, salaryData.gaji9final || 0,
            salaryData.gaji10final || 0,
            total_salary,
            teacher_id,
            tanggal
          ],
          type: QueryTypes.UPDATE,
        }
      );
    } else {
      await SalaryDetail.create({
        ...salaryData,
        total_salary: total_salary,
      });
    }
  }

  static async getAllSalaryByTeacherIdentifier(identifier: string, isNip: boolean = true): Promise<SalaryDetailRecord[]> {
    if (!identifier || typeof identifier !== "string" || identifier.trim() === "") {
      console.warn("Identifier kosong atau tidak valid, skip query.");
      return [];
    }

    let query = '';
    if (isNip) {
      query = `
        SELECT 
          ds.*, 
          t.nama_lengkap AS nama, 
          t.nip, 
          t.jabatan,
          mjp.*
        FROM detail_salary ds
        JOIN teachers t ON ds.teacher_id = t.id
        LEFT JOIN master_jabatan_pokok mjp ON t.jabatan = mjp.jabatan
        WHERE t.nip = ?
        ORDER BY ds.tanggal DESC
      `;
    } else {
      query = `
        SELECT 
          ds.*, 
          t.nama_lengkap AS nama, 
          t.nip, 
          t.jabatan,
          mjp.*
        FROM detail_salary ds
        JOIN teachers t ON ds.teacher_id = t.id
        LEFT JOIN master_jabatan_pokok mjp ON t.jabatan = mjp.jabatan
        WHERE t.id = ?
        ORDER BY ds.tanggal DESC
      `;
    }

    const result = await dbConn.query(query, {
      replacements: [identifier],
      type: QueryTypes.SELECT
    });

    return result as SalaryDetailRecord[];
  }

  static async getSalaryByTeacherAndDate(nip: string, tanggal: string) {
    const teacher = await this.getTeacherByNip(nip);
    if (!teacher?.id) {
      console.warn("Guru tidak ditemukan, getSalaryByTeacherAndDate.");
      return null;
    }

    const result = await dbConn.query(
      "SELECT * FROM detail_salary WHERE teacher_id = ? AND tanggal = ?",
      { replacements: [teacher.id, tanggal], type: QueryTypes.SELECT }
    );
    return result[0] ?? null;
  }

  static async getSalaryDetailByTeacherAndMonth(nip: string, bulan: string): Promise<SalaryDetailRecord[]> {
    const teacher = await this.getTeacherByNip(nip);
    if (!teacher?.id) return [];

    const result = await dbConn.query(
      `
      SELECT ds.*, t.nama_lengkap AS nama, t.nip
      FROM detail_salary ds
      JOIN teachers t ON ds.teacher_id = t.id
      WHERE ds.teacher_id = ? AND to_char(tanggal, 'MM') = ?
      ORDER BY tanggal ASC
      `,
      {
        replacements: [teacher.id, bulan.padStart(2, "0")],
        type: QueryTypes.SELECT,
      }
    );

    return result as any[];
  }

  static async removeSalaryByNip(nip: string, tanggal: string) {
    const teacher = await this.getTeacherByNip(nip);
    if (!teacher?.id) {
      console.warn("Guru tidak ditemukan, removeSalaryByNip.");
      return;
    }

    await dbConn.query(
      "DELETE FROM detail_salary WHERE teacher_id = ? AND tanggal = ?",
      { replacements: [teacher.id, tanggal], type: QueryTypes.DELETE }
    );
  }

  static async hasFileHash(hash: string): Promise<boolean> {
    const result = await UploadedFileHash.findOne({ where: { hash } });
    return !!result;
  }

  static async saveFileHash(hash: string): Promise<void> {
    await UploadedFileHash.create({ hash });
  }
}

export default SalaryDetailRepository;