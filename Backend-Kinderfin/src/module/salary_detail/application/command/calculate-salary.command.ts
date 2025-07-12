import fs from "fs";
import csv from "csv-parser";
import crypto from "crypto";
import { PostgresDatabase } from "../../../../config/database.config";
import { QueryTypes } from "sequelize";
import SalaryDetailRepository from "../../infrastructure/repository/salary_detail.repository";
import { STANDARD_CHECK_OUT } from "../../../../config/constants";
import { STANDARD_CHECK_IN } from "../../../../config/constants";


const isValidTime = (time?: string) => {
  return time && time.trim() !== "-";
};

interface PotonganKeterlambatan {
  batas_menit: number;
  persen_potong: number;
  urutan_gaji_dipotong: number;
  jabatan: string;
  jenis_potongan: string;
}

function calculateEarlyLeaveMinutes(checkOutTime: string): number {
  const [hours, minutes] = checkOutTime.split(":").map(Number);
  const [stdHours, stdMinutes] = STANDARD_CHECK_OUT.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  const standardMinutes = stdHours * 60 + stdMinutes;
  return totalMinutes < standardMinutes ? standardMinutes - totalMinutes : 0;
}

const dbConn = new PostgresDatabase().dbConn;

async function calculateLatenessMinutes(checkInTime: string): Promise<number> {
  const [hours, minutes] = checkInTime.split(":").map(Number);
  const [stdHours, stdMinutes] = STANDARD_CHECK_IN.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  const standardMinutes = stdHours * 60 + stdMinutes;
  return totalMinutes > standardMinutes ? totalMinutes - standardMinutes : 0;
}

function getFileHash(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

async function getBestPotongan(jabatan: string, jenis_potongan: string, menit: number): Promise<PotonganKeterlambatan | null> {
  const query = `
    SELECT * FROM potongan_keterlambatan
    WHERE jabatan = :jabatan
    AND jenis_potongan = :jenis_potongan
    AND batas_menit <= :menit
    ORDER BY batas_menit DESC
    LIMIT 1
  `;
  const result = await dbConn.query<PotonganKeterlambatan>(query, {
    replacements: { jabatan, jenis_potongan, menit },
    type: QueryTypes.SELECT,
  });
  return result[0] ?? null;
}

async function calculateSalary(filePathOrArray: string | any[], source: "upload" | "manual" = "upload"): Promise<{ processed: number, skipped: number }> {
  const potonganList = await dbConn.query<{
    batas_menit: number;
    persen_potong: number;
    urutan_gaji_dipotong: number;
    jabatan: string;
    jenis_potongan: string;
  }>(
    "SELECT * FROM potongan_keterlambatan ORDER BY batas_menit ASC",
    { type: QueryTypes.SELECT }
  );

  let skippedRecords: { reason: string; record: any }[] = [];

  if (source === "manual" && Array.isArray(filePathOrArray)) {
    const attendanceRecords = filePathOrArray;
    let processed = 0;
    let skipped = 0;

    for (const record of attendanceRecords) {
      if (!record.nip || !record.tanggal || (!record.waktu && !record.jam_keluar)) {
        console.log(" Data tidak lengkap:", record);
        skippedRecords.push({ reason: "Data tidak lengkap", record });
        skipped++;
        continue;
      }

      const teacher = await SalaryDetailRepository.getTeacherByNip(record.nip) as {
        id: string;
        nama_lengkap: string;
        jabatan: string;
      };

      if (!teacher) {
        console.log(" Guru tidak ditemukan:", record.nip);
        skippedRecords.push({ reason: "Guru tidak ditemukan", record });
        skipped++;
        continue;
      }

      const existing = await SalaryDetailRepository.getSalaryByTeacherAndDate(record.nip, record.tanggal);

      if (!existing) {
        const salaryComponents = await SalaryDetailRepository.getSalaryComponentsByJabatan(teacher.jabatan);
        if (!salaryComponents) {
          console.log(" Komponen gaji tidak ditemukan:", teacher.jabatan);
          skippedRecords.push({ reason: "Komponen gaji tidak ditemukan", record });
          skipped++;
          continue;
        }

        const gaji: Record<string, number> = {};
        for (let i = 1; i <= 10; i++) {
          gaji[`gaji${i}final`] = salaryComponents[`gaji${i}`] ?? 0;
        }

        const terlambat_menit = isValidTime(record.waktu) ? await calculateLatenessMinutes(record.waktu) : 0;
        let pulangCepatMenit = record.jam_keluar ? calculateEarlyLeaveMinutes(record.jam_keluar) : 0;

        let potongan_datang_telat = 0;
        const potonganTelatKomponen = potonganList.filter(p => p.jabatan === teacher.jabatan && p.jenis_potongan === "datang_telat");

        if (terlambat_menit > 0) {
          const bestPerUrutan = new Map<number, PotonganKeterlambatan>();
          for (const p of potonganTelatKomponen) {
            if (terlambat_menit >= p.batas_menit) {
              const existing = bestPerUrutan.get(p.urutan_gaji_dipotong);
              if (!existing || p.batas_menit > existing.batas_menit) {
                bestPerUrutan.set(p.urutan_gaji_dipotong, p);
              }
            }
          }
          for (const [urutan, potongan] of bestPerUrutan) {
            const key = `gaji${urutan}final`;
            const nilaiPotong = Math.floor((gaji[key] || 0) * (potongan.persen_potong / 100));
            potongan_datang_telat += nilaiPotong;
            gaji[key] -= nilaiPotong;
          }
        }

        let potongan_pulang_cepat = 0;
        const potonganPulangCepatKomponen = potonganList.filter(p => p.jabatan === teacher.jabatan && p.jenis_potongan === "pulang_cepat").sort((a, b) => a.urutan_gaji_dipotong - b.urutan_gaji_dipotong);
        
        if (pulangCepatMenit > 0) {
          const sudahDipakaiPulangCepat: Set<number> = new Set();
          for (const potongan of potonganPulangCepatKomponen) {
            if (pulangCepatMenit >= potongan.batas_menit && !sudahDipakaiPulangCepat.has(potongan.urutan_gaji_dipotong)) {
              const key = `gaji${potongan.urutan_gaji_dipotong}final`;
              const nilaiPotong = Math.floor((gaji[key] || 0) * (potongan.persen_potong / 100));
              potongan_pulang_cepat += nilaiPotong;
              gaji[key] -= nilaiPotong;
              sudahDipakaiPulangCepat.add(potongan.urutan_gaji_dipotong);
            }
          }
        }

        let potongan_tidak_absen_masuk = 0;
        if (!record.waktu) {
          const potonganTidakMasukList = potonganList.filter(p => p.jabatan === teacher.jabatan && p.jenis_potongan === "tidak_absen_masuk");
          for (const p of potonganTidakMasukList) {
            const key = `gaji${p.urutan_gaji_dipotong}final`;
            const nilaiPotong = Math.floor((gaji[key] || 0) * (p.persen_potong / 100));
            potongan_tidak_absen_masuk += nilaiPotong;
            gaji[key] -= nilaiPotong;
          }
        }

        let potongan_tidak_absen_pulang = 0;
        if (!record.jam_keluar) {
          const potonganTidakPulangList = potonganList.filter(p => p.jabatan === teacher.jabatan && p.jenis_potongan === "tidak_absen_pulang");
          for (const p of potonganTidakPulangList) {
            const key = `gaji${p.urutan_gaji_dipotong}final`;
            const nilaiPotong = Math.floor((gaji[key] || 0) * (p.persen_potong / 100));
            potongan_tidak_absen_pulang += nilaiPotong;
            gaji[key] -= nilaiPotong;
          }
        }

        const total_salary = Object.values(gaji).reduce((a, b) => a + b, 0);
        const final_total_salary = Math.max(0, total_salary);

        await SalaryDetailRepository.saveOrUpdateSalaryDetail({
          teacher_id: teacher.id,
          nama_lengkap: teacher.nama_lengkap,
          jabatan: teacher.jabatan,
          tanggal: record.tanggal,
          jam_masuk: record.waktu || null,
          jam_keluar: record.jam_keluar || null,
          ...gaji,
          potongan_datang_telat,
          potongan_pulang_cepat,
          potongan_tidak_absen_masuk,
          potongan_tidak_absen_pulang,
          total_salary: final_total_salary,
        });
        processed++;
      } else {
        if (record.jam_keluar) {
          await SalaryDetailRepository.updateJamKeluar(record.nip, record.tanggal, record.jam_keluar);
        }
        processed++;
      }
    }
    console.log("Data yang dilewati:");
    console.table(skippedRecords);
    const message = processed > 0 ? `${processed} data berhasil diproses manual` : "data sudah ada";
    console.log(`Total tersimpan: ${processed}, dilewati: ${skipped}`);
    return { processed, skipped };
  }

  if (source === "upload") {
    const filePath = filePathOrArray as string;
    const fileHash = await getFileHash(filePath);
    const isDuplicate = await SalaryDetailRepository.hasFileHash(fileHash);
    if (isDuplicate) throw new Error(" File ini sudah pernah diproses sebelumnya.");

    const attendanceMap = new Map<string, { nip: string; tanggal: string; check_in_time: string, jam_keluar?: string }>();

    return new Promise<{ processed: number; skipped: number }>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({
          mapHeaders: ({ header }) => header.trim().toLowerCase()
        }))
        .on("data", (row: any) => {
          const key = `${row.nip}-${row.tanggal}`;
          const existing = attendanceMap.get(key);

          if (!existing) {
            attendanceMap.set(key, {
              nip: row.nip,
              tanggal: row.tanggal,
              check_in_time: row.check_in_time,
              jam_keluar: row.jam_keluar, 
            });
          } else {
            const [hOld, mOld] = existing.check_in_time.split(":").map(Number);
            const [hNew, mNew] = row.check_in_time.split(":").map(Number);
            const oldMinutes = hOld * 60 + mOld;
            const newMinutes = hNew * 60 + mNew;
            if (newMinutes < oldMinutes) {
              attendanceMap.set(key, {
                nip: row.nip,
                tanggal: row.tanggal,
                check_in_time: row.check_in_time,
                jam_keluar: row.jam_keluar, 
              });
            }
          }
        })
        .on("end", () => {
          (async () => {
            const attendanceRecords = Array.from(attendanceMap.values());
            console.log("Total record diproses:", attendanceRecords.length);
            let processed = 0;
            let skipped = 0;

            for (const record of attendanceRecords) {
              const teacher = await SalaryDetailRepository.getTeacherByNip(record.nip) as {
                id: string;
                nama_lengkap: string;
                jabatan: string;
              };

              if (!teacher) {
                console.log(" Guru tidak ditemukan:", record.nip);
                skippedRecords.push({ reason: "Guru tidak ditemukan", record });
                skipped++;
                continue;
              }

              const existing = await SalaryDetailRepository.getSalaryByTeacherAndDate(record.nip, record.tanggal);
              if (existing) {
                console.log(" Duplikat ditemukan, dilewati:", record);
                skippedRecords.push({ reason: "Duplikat ditemukan", record });
                skipped++;
                continue;
              }

              const salaryComponents = await SalaryDetailRepository.getSalaryComponentsByJabatan(teacher.jabatan);
              if (!salaryComponents) {
                console.log(" Komponen gaji tidak ditemukan:", teacher.jabatan);
                skippedRecords.push({ reason: "Komponen gaji tidak ditemukan", record });
                skipped++;
                continue;
              }

              const gaji: Record<string, number> = {};
              for (let i = 1; i <= 10; i++) {
                gaji[`gaji${i}final`] = salaryComponents[`gaji${i}`] ?? 0;
              }

              const terlambat_menit = isValidTime(record.check_in_time) ? await calculateLatenessMinutes(record.check_in_time) : 0;
              let pulangCepatMenit = 0;
              if (record.jam_keluar) {
                  pulangCepatMenit = calculateEarlyLeaveMinutes(record.jam_keluar);
              }

              let potongan_datang_telat = 0;
              const potonganTelatKomponen = potonganList.filter(p => p.jabatan === teacher.jabatan && p.jenis_potongan === "datang_telat");

              if (terlambat_menit > 0) {
                const bestPerUrutan = new Map<number, PotonganKeterlambatan>();
                for (const p of potonganTelatKomponen) {
                  if (terlambat_menit >= p.batas_menit) {
                    const existing = bestPerUrutan.get(p.urutan_gaji_dipotong);
                    if (!existing || p.batas_menit > existing.batas_menit) {
                      bestPerUrutan.set(p.urutan_gaji_dipotong, p);
                    }
                  }
                }
                for (const [urutan, potongan] of bestPerUrutan) {
                  const key = `gaji${urutan}final`;
                  const nilaiPotong = Math.floor((gaji[key] || 0) * (potongan.persen_potong / 100));
                  potongan_datang_telat += nilaiPotong;
                  gaji[key] -= nilaiPotong;
                }
              }

              let potongan_pulang_cepat = 0;
              let potonganPulangCepatKomponen = potonganList.filter((p) => p.jabatan === teacher.jabatan && p.jenis_potongan === "pulang_cepat").sort((a, b) => a.urutan_gaji_dipotong - b.urutan_gaji_dipotong);
              
              if (pulangCepatMenit > 0) {
                const sudahDipakaiPulangCepat: Set<number> = new Set();
                for (const potongan of potonganPulangCepatKomponen) {
                  if (pulangCepatMenit >= potongan.batas_menit && !sudahDipakaiPulangCepat.has(potongan.urutan_gaji_dipotong)) {
                    const key = `gaji${potongan.urutan_gaji_dipotong}final`;
                    const nilaiPotong = Math.floor((gaji[key] || 0) * (potongan.persen_potong / 100));
                    potongan_pulang_cepat += nilaiPotong;
                    gaji[key] -= nilaiPotong;
                    sudahDipakaiPulangCepat.add(potongan.urutan_gaji_dipotong);
                  }
                }
              }

              let potongan_tidak_absen_masuk = 0;
              if (!record.check_in_time) {
                const potonganTidakMasukList = potonganList.filter((p) => p.jabatan === teacher.jabatan && p.jenis_potongan === "tidak_absen_masuk");
                for (const p of potonganTidakMasukList) {
                  const key = `gaji${p.urutan_gaji_dipotong}final`;
                  const nilaiPotong = Math.floor((gaji[key] || 0) * (p.persen_potong / 100));
                  potongan_tidak_absen_masuk += nilaiPotong;
                  gaji[key] -= nilaiPotong;
                }
              }

              let potongan_tidak_absen_pulang = 0;
              if (!record.jam_keluar) {
                const potonganTidakPulangList = potonganList.filter((p) => p.jabatan === teacher.jabatan && p.jenis_potongan === "tidak_absen_pulang");
                for (const p of potonganTidakPulangList) {
                  const key = `gaji${p.urutan_gaji_dipotong}final`;
                  const nilaiPotong = Math.floor((gaji[key] || 0) * (p.persen_potong / 100));
                  potongan_tidak_absen_pulang += nilaiPotong;
                  gaji[key] -= nilaiPotong;
                }
              }

              const total_salary = Object.values(gaji).reduce((a, b) => a + b, 0);
              const final_total_salary = Math.max(0, total_salary);

              await SalaryDetailRepository.saveOrUpdateSalaryDetail({
                teacher_id: teacher.id,
                nama_lengkap: teacher.nama_lengkap,
                jabatan: teacher.jabatan,
                tanggal: record.tanggal,
                jam_masuk: record.check_in_time, 
                jam_keluar: record.jam_keluar, 
                ...gaji,
                potongan_datang_telat,
                potongan_pulang_cepat,
                potongan_tidak_absen_masuk,
                potongan_tidak_absen_pulang,
                total_salary: final_total_salary,
              });

              processed++;
            }

            await SalaryDetailRepository.saveFileHash(fileHash);

            console.log("Data yang dilewati:");
            console.table(skippedRecords);
            console.log("Total tersimpan:", processed);

            skipped = skippedRecords.length;

            resolve({ processed, skipped });
          })().catch(reject);
        })
        .on("error", reject);
    });
  }

  return { processed: 0, skipped: 0 }; // fallback
}

export default calculateSalary;