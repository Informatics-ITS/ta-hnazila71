// master_jabatan/presentation/controller/master_jabatan.controller.ts
// KODE LENGKAP SETELAH DIROMBAK

import { Request, Response } from "express";
import MasterJabatanCommand from "../../application/command/master_jabatan.command";
import MasterJabatanQuery from "../../application/query/master_jabatan.query";
import MasterJabatanPokokRepository from "../../infrastructure/repository/master_jabatan_pokok.repository";
import MasterJabatanRepository from "../../infrastructure/repository/master_jabatan.repository";
import { SequelizeLogRepository } from "../../../activity_log/infrastructure/storage/repository/sequelize-log.repository";
import { CreateLogCommand } from "../../../activity_log/application/command/create-log.command";
import { buildLogDescription } from "../../../activity_log/utils/buildLogDescription";
import { PostgresDatabase } from "../../../../config/database.config";
import { QueryTypes } from "sequelize";

const dbConn = new PostgresDatabase().dbConn;

const getUserEmail = async (id_user: string): Promise<string> => {
  const [user] = await dbConn.query(
    "SELECT email FROM users WHERE id = :id LIMIT 1",
    {
      replacements: { id: id_user },
      type: QueryTypes.SELECT,
    }
  );
  return (user as any)?.email || "unknown@example.com";
};

const validateNonNegativeValues = (data: Record<string, any>): string | null => {
  const gajiFields = [
    "gaji1", "gaji2", "gaji3", "gaji4", "gaji5", "gaji6", "gaji7", "gaji8", "gaji9", "gaji10",
    "gaji_pokok1", "gaji_pokok2", "gaji_pokok3", "gaji_pokok4", "gaji_pokok5", 
    "gaji_pokok6", "gaji_pokok7", "gaji_pokok8", "gaji_pokok9", "gaji_pokok10"
  ];

  for (const field of gajiFields) {
    if (data[field] !== undefined && data[field] !== null) {
      const value = Number(data[field]);
      if (isNaN(value)) {
        return `Field ${field} harus berupa angka`;
      }
      if (value < 0) {
        return `Nilai gaji tidak boleh kurang dari 0`;
      }
    }
  }
  return null;
};

export class MasterJabatanController {
  async getAll(req: Request, res: Response) {
    try {
      const jabatanList = await MasterJabatanQuery.GetAllMasterJabatanQuery.execute();
      const pokokList = await MasterJabatanPokokRepository.getAll();
  
      const combined = jabatanList.map((harian: any) => {
        const match = pokokList.find((p: any) => p.jabatan === harian.jabatan);
  
        // Ini adalah versi paling aman
        const dataHarian = harian;
        const dataPokok = match && typeof match.toJSON === 'function' ? match.toJSON() : match;
  
        return {
          ...dataHarian,
          ...(dataPokok || {}),
        };
      });
  
      res.status(200).json({
        message: "Jabatan ditemukan",
        data: combined,
      });
    } catch (error) {
      res.status(500).json({
        error: "Gagal mengambil data gabungan jabatan",
        detail: (error as Error).message,
      });
    }
  }
  
  async getByJabatan(req: Request, res: Response) {
    try {
      const jabatan = req.params.jabatan?.trim();
      if (!jabatan || typeof jabatan !== "string") {
        return res.status(400).json({ error: "Jabatan tidak boleh kosong dan harus berupa string" });
      }
  
      const data = await MasterJabatanQuery.GetMasterJabatanByJabatanQuery.execute(jabatan);
      const pokok = await MasterJabatanPokokRepository.findByName(jabatan);
  
      // Jika data harian dan pokok sama-sama tidak ditemukan
      if (!data && !pokok) {
        return res.status(404).json({ message: "Jabatan tidak ditemukan" });
      }
  
      // Lakukan pengecekan aman sebelum memanggil .toJSON()
      const dataHarian = data && typeof data.toJSON === 'function' ? data.toJSON() : data;
      const dataPokok = pokok && typeof pokok.toJSON === 'function' ? pokok.toJSON() : pokok;
  
      res.json({ 
        message: "Jabatan ditemukan", 
        data: { 
          ...(dataHarian || {}), 
          ...(dataPokok || {}) 
        } 
      });
    } catch (error) {
      res.status(500).json({ error: "Terjadi kesalahan saat mengambil data", detail: (error as Error).message });
    }
  }

  async createFull(req: Request, res: Response) {
    const t = await dbConn.transaction(); // Mulai transaksi

    try {
      const data = req.body;

      // Validasi Input
      if (!data.jabatan || typeof data.jabatan !== "string") {
        await t.rollback();
        return res.status(400).json({ error: "Jabatan harus diisi dan berupa string" });
      }

      const validationError = validateNonNegativeValues(data);
      if (validationError) {
        await t.rollback();
        return res.status(400).json({ error: validationError });
      }

      const existing = await MasterJabatanRepository.findByName(data.jabatan);
      if (existing) {
        await t.rollback();
        return res.status(409).json({ error: `Jabatan '${data.jabatan}' sudah ada.` });
      }

      // --- URUTAN OPERASI YANG BENAR DI DALAM TRANSAKSI ---

      // 1. Buat data di tabel induk (master_jabatan) terlebih dahulu
      const harianData = await MasterJabatanRepository.create(data, { transaction: t });

      // 2. Buat data di tabel anak (master_jabatan_pokok)
      const pokokData = await MasterJabatanPokokRepository.create(data, { transaction: t });

      // 3. Jika semua berhasil, commit transaksi
      await t.commit();

      // Logging setelah transaksi berhasil
      const logRepo = new SequelizeLogRepository();
      const createLog = new CreateLogCommand(logRepo);
      const email = await getUserEmail(res.locals.id_user);

      await createLog.execute({
        user_id: res.locals.id_user,
        email,
        action: "Membuat Jabatan",
        module: "Master Jabatan",
        description: buildLogDescription("Membuat Jabatan", data.jabatan),
      });
      
      const combinedData = {
        ...harianData.toJSON(),
        ...pokokData.toJSON()
      };

      res.status(201).json({ message: "Jabatan gabungan berhasil ditambahkan", data: combinedData });
    } catch (error) {
      // 4. Jika terjadi error di mana pun, batalkan semua perubahan
      await t.rollback();
      res.status(500).json({ error: "Terjadi kesalahan saat menyimpan data gabungan", detail: (error as Error).message });
    }
  }

  async update(req: Request, res: Response) {
    const t = await dbConn.transaction(); // Mulai transaksi untuk update

    try {
      const jabatan = req.params.jabatan?.trim();
      if (!jabatan || typeof jabatan !== "string") {
        await t.rollback();
        return res.status(400).json({ error: "Jabatan tidak boleh kosong dan harus berupa string" });
      }
      
      const dataToUpdate = req.body;
      const validationError = validateNonNegativeValues(dataToUpdate);
      if (validationError) {
        await t.rollback();
        return res.status(400).json({ error: validationError });
      }

      // Cek apakah jabatan ada
      const existing = await MasterJabatanRepository.findByName(jabatan);
      if (!existing) {
        await t.rollback();
        return res.status(404).json({ message: "Jabatan tidak ditemukan" });
      }

      // Memisahkan data untuk masing-masing tabel
      const harianFields = ["gaji1", "gaji2", "gaji3", "gaji4", "gaji5", "gaji6", "gaji7", "gaji8", "gaji9", "gaji10"];
      const pokokFields = ["gaji_pokok1", "gaji_pokok2", "gaji_pokok3", "gaji_pokok4", "gaji_pokok5", "gaji_pokok6", "gaji_pokok7", "gaji_pokok8", "gaji_pokok9", "gaji_pokok10"];
      
      const harianUpdateData: Record<string, any> = {};
      const pokokUpdateData: Record<string, any> = {};

      Object.keys(dataToUpdate).forEach(key => {
        if (harianFields.includes(key)) harianUpdateData[key] = dataToUpdate[key];
        if (pokokFields.includes(key)) pokokUpdateData[key] = dataToUpdate[key];
      });

      // Lakukan update dalam transaksi
      if (Object.keys(harianUpdateData).length > 0) {
        await MasterJabatanRepository.update(jabatan, harianUpdateData, { transaction: t });
      }
      if (Object.keys(pokokUpdateData).length > 0) {
        await MasterJabatanPokokRepository.update(jabatan, pokokUpdateData, { transaction: t });
      }

      await t.commit(); // Commit jika berhasil

      // Logging
      const logRepo = new SequelizeLogRepository();
      const createLog = new CreateLogCommand(logRepo);
      const email = await getUserEmail(res.locals.id_user);

      await createLog.execute({
        user_id: res.locals.id_user,
        email,
        action: "Perbarui Gaji Jabatan",
        module: "Master Jabatan",
        description: buildLogDescription("Perbarui Gaji Jabatan", jabatan),
      });

      res.json({ message: "Gaji jabatan berhasil diperbarui" });
    } catch (error) {
      await t.rollback(); // Rollback jika ada error
      res.status(500).json({ error: "Terjadi kesalahan saat memperbarui data", detail: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response) {
    const t = await dbConn.transaction(); // Mulai transaksi untuk delete

    try {
      const jabatan = req.params.jabatan?.trim();
      if (!jabatan || typeof jabatan !== "string") {
        await t.rollback();
        return res.status(400).json({ error: "Jabatan tidak boleh kosong dan harus berupa string" });
      }

      // Hapus dari tabel anak terlebih dahulu untuk menghindari FK violation
      await MasterJabatanPokokRepository.delete(jabatan, { transaction: t });
      
      // Hapus dari tabel induk
      const harianDeletedCount = await MasterJabatanRepository.delete(jabatan, { transaction: t });
      
      if (harianDeletedCount === 0) {
         // Jika tidak ada yang dihapus di tabel utama, mungkin data tidak ada
         await t.rollback();
         return res.status(404).json({ message: "Jabatan tidak ditemukan untuk dihapus" });
      }

      await t.commit(); // Commit jika berhasil

      // Logging
      const logRepo = new SequelizeLogRepository();
      const createLog = new CreateLogCommand(logRepo);
      const email = await getUserEmail(res.locals.id_user);

      await createLog.execute({
        user_id: res.locals.id_user,
        email,
        action: "Hapus Jabatan",
        module: "Master Jabatan",
        description: buildLogDescription("Hapus Jabatan", jabatan),
      });

      res.json({ message: "Jabatan berhasil dihapus" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: "Terjadi kesalahan saat menghapus data", detail: (error as Error).message });
    }
  }
}

export default new MasterJabatanController();