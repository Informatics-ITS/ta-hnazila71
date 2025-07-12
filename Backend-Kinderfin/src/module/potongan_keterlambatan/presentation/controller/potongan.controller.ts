import { Request, Response } from "express";
import { SequelizePotonganRepository } from "../../infrastructure/storage/repository/potongan.repository";
import { CreatePotonganCommand } from "../../application/command/create-potongan.command";
import { PotonganQuery } from "../../application/query/potongan.query";

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

const repo = new SequelizePotonganRepository();
const createCommand = new CreatePotonganCommand(repo);
const query = new PotonganQuery(repo);

export class PotonganController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { jabatan, urutan_gaji_dipotong, persen_potong, batas_menit, tipe_jam } = req.body;

      const jenisPotonganMap: Record<string, string> = {
        datang: "datang_telat",
        pulang: "pulang_cepat",
        tidak_absen_masuk: "tidak_absen_masuk",
        tidak_absen_pulang: "tidak_absen_pulang",
      };

      const jenis_potongan = jenisPotonganMap[tipe_jam];

      if (!jenis_potongan) {
        res.status(400).json({ message: "Jenis potongan harus 'datang_telat', 'pulang_cepat', 'tidak_absen_masuk', atau 'tidak_absen_pulang'" });
        return;
      }

      const duplicate = await repo.findByJabatanAndBatas(jabatan, batas_menit, jenis_potongan, urutan_gaji_dipotong);
  
      if (duplicate) {
        res.status(400).json({
          message: "Data duplikat: kombinasi jabatan, batas menit, jenis potongan, dan urutan gaji sudah ada.",
        });
        return;
      }

      const result = await createCommand.execute({
        jabatan,
        urutan_gaji_dipotong: Number(urutan_gaji_dipotong),
        persen_potong: Number(persen_potong),
        batas_menit: Number(batas_menit),
        jenis_potongan,  
      });
  
      const logRepo = new SequelizeLogRepository();
      const createLog = new CreateLogCommand(logRepo);
      const email = await getUserEmail(res.locals.id_user);
  
      await createLog.execute({
        user_id: res.locals.id_user,
        email,
        action: "Membuat Potongan Gaji",
        module: "Potongan Gaji",
        description: buildLogDescription("Membuat Potongan Gaji", jabatan),
      });
  
      res.status(201).json({
        message: "Potongan berhasil ditambahkan",
        data: result,
      });
  
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
  

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { jabatan, urutan_gaji_dipotong, persen_potong, batas_menit, tipe_jam } = req.body;

      const jenisPotonganMap: Record<string, string> = {
        datang: "datang_telat",
        pulang: "pulang_cepat",
        tidak_absen_masuk: "tidak_absen_masuk",
        tidak_absen_pulang: "tidak_absen_pulang",
      };

      const jenis_potongan = jenisPotonganMap[tipe_jam];

      if (!jenis_potongan) {
        res.status(400).json({ message: "Jenis potongan tidak valid" });
        return;
      }
  
      const found = await repo.findById(id);
      if (!found) {
        res.status(404).json({ message: "Potongan tidak ditemukan" });
        return;
      }
  
      const duplicate = await repo.findByJabatanAndBatas(jabatan, batas_menit, jenis_potongan, urutan_gaji_dipotong);
  
      if (duplicate && duplicate.id !== id) {
        res.status(400).json({
          message: "Data duplikat: kombinasi jabatan, batas menit, jenis potongan, dan urutan gaji sudah ada.",
        });
        return;
      }
  
      await repo.update(id, {
        jabatan,
        urutan_gaji_dipotong: Number(urutan_gaji_dipotong),
        persen_potong: Number(persen_potong),
        batas_menit: Number(batas_menit),
      });
  
      const logRepo = new SequelizeLogRepository();
      const createLog = new CreateLogCommand(logRepo);
      const email = await getUserEmail(res.locals.id_user);
  
      await createLog.execute({
        user_id: res.locals.id_user,
        email,
        action: "Perbarui Potongan Gaji",
        module: "Potongan Gaji",
        description: buildLogDescription("Perbarui Potongan Gaji", jabatan),
      });
  
      res.json({ message: "Potongan berhasil diperbarui" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
  

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const found = await repo.findById(id);
      if (!found) {
        res.status(404).json({ message: "Potongan tidak ditemukan" });
        return;
      }

      await repo.delete(id);

      const logRepo = new SequelizeLogRepository();
      const createLog = new CreateLogCommand(logRepo);
      const email = await getUserEmail(res.locals.id_user);

      await createLog.execute({
        user_id: res.locals.id_user,
        email,
        action: "Hapus Potongan Gaji",
        module: "Potongan Gaji",
        description: buildLogDescription("Hapus Potongan Gaji", found.jabatan),
      });

      res.json({ message: "Potongan berhasil dihapus" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await query.getAll();

      res.status(200).json(result ?? []);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await repo.findById(id);

      if (!result) {
        res.status(404).json({ message: "Potongan tidak ditemukan" });
      } else {
        res.status(200).json({ data: result });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
