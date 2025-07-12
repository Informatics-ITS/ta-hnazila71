import { PostgresDatabase } from "../../../../config/database.config";
import { QueryTypes } from "sequelize";
import SalaryDetailRepository from "../../infrastructure/repository/salary_detail.repository";
import { generateFinalSalaryPDF } from "../../infrastructure/pdf/pdf-generator.service";
import path from "path";
import fs from "fs";

const dbConn = new PostgresDatabase().dbConn;

async function processFinalSalary(startDate: string, endDate: string): Promise<void> {
  const teachers = await dbConn.query<{
    id: string;
    nama_lengkap: string;
    jabatan: string;
  }>("SELECT id, nama_lengkap, jabatan FROM teachers", { type: QueryTypes.SELECT });

  const hasilAkhir: any[] = [];

  for (const teacher of teachers) {
    const pokok = await dbConn.query<Record<string, number>>(
      "SELECT * FROM master_jabatan_pokok WHERE jabatan = ?",
      { replacements: [teacher.jabatan], type: QueryTypes.SELECT }
    );

    const harian = await dbConn.query<{
      total_salary: number;
    }>(
      `SELECT COALESCE(SUM(total_salary), 0) AS total_salary 
       FROM detail_salary 
       WHERE teacher_id = ? 
       AND tanggal BETWEEN ? AND ?`,
      { replacements: [teacher.id, startDate, endDate], type: QueryTypes.SELECT }
    );

    const totalPokok = pokok[0]
      ? Object.values(pokok[0])
          .filter((_, i) => i >= 1 && i <= 10)
          .reduce((a, b) => a + (b || 0), 0)
      : 0;

    const totalHarian = harian[0]?.total_salary || 0;
    const totalGabungan = totalPokok + totalHarian;

    hasilAkhir.push({
      nama: teacher.nama_lengkap,
      jabatan: teacher.jabatan,
      total_pokok: totalPokok,
      total_harian: totalHarian,
      total_gaji: totalGabungan,
      periode: `${startDate} s.d. ${endDate}`,
    });
  }

  const outputPath = path.resolve("tmp", `final_salary_${startDate}_${endDate}.pdf`);
if (!fs.existsSync("tmp")) fs.mkdirSync("tmp");
await generateFinalSalaryPDF(hasilAkhir, outputPath);

}

export default processFinalSalary;
