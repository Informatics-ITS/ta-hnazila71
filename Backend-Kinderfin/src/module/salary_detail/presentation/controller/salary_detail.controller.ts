import { Request, Response } from "express";
import { parse } from "json2csv";
import calculateSalary from "../../application/command/calculate-salary.command";
import SalaryDetailRepository from "../../infrastructure/repository/salary_detail.repository";
import getSalaryDetail from "../../application/query/get-salary-detail.query";
import path from "path";
import fs from "fs";
import { QueryTypes } from "sequelize";
import { generateFinalSalaryPDF } from "../../infrastructure/pdf/pdf-generator.service";
import processFinalSalary from "../../application/command/process-final-salary.command";
import { PostgresDatabase } from "../../../../config/database.config";
import { CreateLogCommand } from "../../../activity_log/application/command/create-log.command"
import { SequelizeLogRepository } from "../../../activity_log/infrastructure/storage/repository/sequelize-log.repository";
import { buildLogDescription } from "../../../activity_log/utils/buildLogDescription";
// import RekapBonus from "../../../rekap_bonus/domain/entity/rekap_bonus.entity"; // Tidak lagi diperlukan impor langsung entitas di sini
import RekapBonusService from "../../../rekap_bonus/domain/service/rekap_bonus.service"; // Import the service

const dbConn = new PostgresDatabase().dbConn;

class SalaryDetailController {

  async removeSalary(req: Request, res: Response) {
    try {
      const nip = req.params.nip?.trim();
      const tanggal = req.params.tanggal?.trim();

      if (!nip || !tanggal) {
        return res.status(400).json({ error: "nip dan tanggal tidak boleh kosong" });
      }

      await SalaryDetailRepository.removeSalaryByNip(nip, tanggal);

      // Logging activity after successful removal
      const { id_user } = res.locals;
      const [user] = await dbConn.query(
        "SELECT email FROM users WHERE id = :id LIMIT 1",
        {
          replacements: { id: id_user },
          type: QueryTypes.SELECT,
        }
      );

      if (user) {
        const logRepo = new SequelizeLogRepository();
        const createLog = new CreateLogCommand(logRepo);

        await createLog.execute({
          user_id: id_user,
          email: (user as any).email,
          action: "Hapus Gaji Harian",
          module: "Salary Detail",
          description: buildLogDescription("Hapus Gaji Harian", `nip: ${nip}, tanggal: ${tanggal}`),
        });
      } else {
        console.warn(`User dengan id ${id_user} tidak ditemukan. Log tidak dibuat.`);
      }

      return res.status(200).json({ message: "Data gaji harian berhasil dihapus" });
    } catch (error) {
      return res.status(500).json({
        error: "Terjadi kesalahan saat menghapus gaji harian",
        detail: (error as Error).message,
      });
    }
  }

  async getMonthlySalaryByTeacher(req: Request, res: Response): Promise<void> {
    try {
      const { nip, bulan } = req.params;

      if (!nip || !bulan) {
        res.status(400).json({ error: "NIP dan bulan tidak boleh kosong" });
        return;
      }

      const salaryDetails: any[] = await SalaryDetailRepository.getSalaryDetailByTeacherAndMonth(
        nip,
        bulan.toString()
      );

      if (!salaryDetails || salaryDetails.length === 0) {
        res.status(404).json({ error: "Data gaji tidak ditemukan untuk guru tersebut" });
        return;
      }

      const { nama, jabatan } = salaryDetails[0];

      const totalHari = salaryDetails.length;
      const totalJam = salaryDetails.reduce((acc, item) => acc + (item.jumlah_jam || 0), 0);
      const totalGaji = salaryDetails.reduce((acc, item) => acc + (item.total_salary || 0), 0);

      const detail_pegawai = {
        nama,
        nip,
        jabatan,
        bulan,
        totalHari,
        totalJam,
        totalGaji,
      };

      const detailPerHari = Array.from({ length: 30 }, (_, i) => {
        const day = (i + 1).toString().padStart(2, "0");
        const tanggal = `${bulan.toString().padStart(2, "0")}-${day}`;

        const data = salaryDetails.find(d => {
          const tanggalStr = new Date(d.tanggal).toISOString().split("T")[0];
          return tanggalStr.endsWith(`-${day}`);
        });

        const terlambat = data?.terlambat_menit ?? 0;

        let jamMasuk = "Tepat Waktu";
        if (terlambat > 0) {
          const jam = Math.floor(7 + terlambat / 60);
          const menit = (terlambat % 60).toString().padStart(2, "0");
          jamMasuk = `${jam.toString().padStart(2, "0")}:${menit}`;
        }

        const detailGaji: Record<string, number> = {};
        for (let j = 1; j <= 10; j++) {
          detailGaji[`gaji${j}final`] = data?.[`gaji${j}final`] ?? 0;
        }

        return {
          tanggal,
          jamMasuk,
          detail_gaji: detailGaji,
          potonganTerlambat: data?.potongan_terlambat || 0,
          totalGaji: data?.total_salary || 0,
        };
      });

      res.status(200).json({ detail_pegawai, detail: detailPerHari });
    } catch (error) {
      console.error("[getMonthlySalaryByTeacher] Error:", error);
      res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
  }

  async getAllSalaryByTeacher(req: Request, res: Response) {
    try {
      const nip = req.params.nip?.trim();
      if (!nip) {
        return res.status(400).json({ error: "NIP tidak boleh kosong" });
      }

      const salaryDetails = await SalaryDetailRepository.getAllSalaryByTeacherIdentifier(nip);
      if (!salaryDetails || salaryDetails.length === 0) {
        return res.status(404).json({ error: "Data gaji tidak ditemukan" });
      }

      return res.status(200).json({ data: salaryDetails });
    } catch (error) {
      console.error("[getAllSalaryByTeacher] Error:", error);
      return res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
  }

  async getSalaryByTeacherAndDate(req: Request, res: Response) {
    try {
      const nip = req.params.nip?.trim();
      const tanggal = req.query.tanggal?.toString().trim();

      if (!nip || !tanggal) {
        return res.status(400).json({ error: "nip dan tanggal tidak boleh kosong" });
      }

      const data = await getSalaryDetail(nip, tanggal);
      if (!data) {
        return res.status(404).json({ error: "Data gaji tidak ditemukan" });
      }

      return res.status(200).json({ message: "Data ditemukan", data });
    } catch (error) {
      return res.status(500).json({
        error: "Terjadi kesalahan saat mengambil data gaji harian",
        detail: (error as Error).message,
      });
    }
  }

  async generateFinalPdf(req: Request, res: Response) {
    try {
      const { start_date, end_date, nip, uang_tambahan, keterangan } = req.body;

      if (!start_date || !end_date || !nip) {
        return res.status(400).json({ error: "start_date, end_date, dan nip wajib diisi" });
      }

      const teachers = await dbConn.query<{
        id: string;
        nama_lengkap: string;
        jabatan: string;
        nip: string;
      }>(
        "SELECT id, nama_lengkap, jabatan, nip FROM teachers WHERE nip = ?",
        { replacements: [nip], type: QueryTypes.SELECT }
      );

      const teacher = teachers[0];

      // Handle case where teacher is not found explicitly
      if (!teacher) {
        return res.status(404).json({ error: `Guru dengan NIP '${nip}' tidak ditemukan.` });
      }

      const pokok = await dbConn.query<Record<string, number>>(
        "SELECT * FROM master_jabatan_pokok WHERE jabatan = ?",
        {
          replacements: [teacher.jabatan],
          type: QueryTypes.SELECT,
        }
      );

      const harianDetail = await dbConn.query(
        `SELECT tanggal, jam_masuk, jam_keluar, potongan_datang_telat, potongan_pulang_cepat, total_salary 
         FROM detail_salary 
         WHERE teacher_id = ? AND tanggal BETWEEN ? AND ? 
         ORDER BY tanggal ASC`,
        {
          replacements: [teacher.id, start_date, end_date],
          type: QueryTypes.SELECT,
        }
      );

      const harianTotal = await dbConn.query(
        `SELECT COALESCE(SUM(total_salary), 0) AS total_salary 
         FROM detail_salary 
         WHERE teacher_id = ? AND tanggal BETWEEN ? AND ?`,
        {
          replacements: [teacher.id, start_date, end_date],
          type: QueryTypes.SELECT,
        }
      );

      const totalPokok = pokok[0]
        ? Object.values(pokok[0])
            .filter((_, i) => i >= 1 && i <= 10)
            .reduce((a, b) => a + (b || 0), 0)
        : 0;

      const totalHarian = (harianTotal[0] as any)?.total_salary || 0;
      const totalTambahan = parseInt(uang_tambahan || "0", 10);
      const finalTotal = totalHarian + totalTambahan;
      const totalGabungan = Number(totalPokok) + finalTotal;

      const rincian = harianDetail.map((h: any) => {
        return {
          tanggal: h.tanggal,
          jam_masuk: h.jam_masuk || "-",
          jam_keluar: h.jam_keluar || "-",
          potongan_datang_telat: h.potongan_datang_telat || 0,
          potongan_pulang_cepat: h.potongan_pulang_cepat || 0,
          potongan_tidak_hadir: 0,
          potongan_tidak_absen: 0,
          total_salary: h.total_salary || 0,
        };
      });

      const filename = `salary_${teacher.nip}_${start_date}_${end_date}.pdf`;
      const outputPath = path.resolve("tmp", filename);

      if (!fs.existsSync("tmp")) fs.mkdirSync("tmp");

      const hasil = {
        nama: teacher.nama_lengkap,
        nip: teacher.nip,
        jabatan: teacher.jabatan,
        periode: `${start_date} s.d. ${end_date}`,
        total_pokok: totalPokok,
        total_harian: totalHarian,
        total_gaji: totalGabungan,
        total_bonus: totalTambahan,
        keterangan: keterangan || "",
        rincian: rincian
      };

      await generateFinalSalaryPDF([hasil], outputPath);

      // FIX: Gunakan RekapBonusService.createRekap untuk memastikan teacher_id yang benar digunakan
      if ((Number(uang_tambahan) > 0) || (keterangan && keterangan.trim() !== '')) {
        await RekapBonusService.createRekap({
          tanggal: new Date().toISOString().slice(0, 10), // Pastikan format tanggal sesuai
          start_date: start_date,
          end_date: end_date,
          nip: nip, // Kirim nip, service akan mencari teacher_id yang benar
          uang_tambahan: Number(uang_tambahan || 0),
          keterangan: keterangan || "",
        });
      }
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      const stream = fs.createReadStream(outputPath);
      stream.pipe(res);
      stream.on("error", (err) => {
        console.error("[generateFinalPdf] File read error:", err);
        res.status(500).json({ error: "Gagal membuka file PDF." });
      });
    } catch (error) {
      console.error("[generateFinalPdf] Error:", error);
      res.status(500).json({ error: "Terjadi kesalahan saat proses cetak PDF final" });
    }
  }

  async manualInput(req: Request, res: Response) {
    try {
      const inputArray = req.body;
      const result = await calculateSalary(inputArray, "manual");
  
      const message =
        result.processed > 0
          ? `${result.processed} data berhasil diproses manual`
          : "data sudah ada";
  
      res.status(200).json({ message });
  
      if (result.processed > 0) {
        const { id_user } = res.locals;
        const [user] = await dbConn.query(
          "SELECT email FROM users WHERE id = :id LIMIT 1",
          {
            replacements: { id: id_user },
            type: QueryTypes.SELECT,
          }
        );

        if (user) {
          const logRepo = new SequelizeLogRepository();
          const createLog = new CreateLogCommand(logRepo);

          await createLog.execute({
            user_id: id_user,
            email: (user as any).email,
            action: "Upload Gaji Manual",
            module: "Salary Detail",
            description: buildLogDescription("Upload Gaji Manual", JSON.stringify(inputArray)),
          });
        } else {
          console.warn(`User dengan id ${id_user} tidak ditemukan. Log tidak dibuat.`);
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Gagal proses input manual" });
    }
  }
  
}

export default new SalaryDetailController();