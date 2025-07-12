import { Request, Response } from "express";
import { savePengaturanGajiAktifCommand, deletePengaturanGajiAktifCommand } from "../../application/command/save-pengaturan.command"; //
import GetPengaturanGajiAktifQuery from "../../application/query/get-pengaturan.query"; //
import { SequelizeLogRepository } from "../../../activity_log/infrastructure/storage/repository/sequelize-log.repository"; //
import { CreateLogCommand } from "../../../activity_log/application/command/create-log.command"; //
import { buildLogDescription } from "../../../activity_log/utils/buildLogDescription"; //
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

export class PengaturanGajiAktifController {
  async get(req: Request, res: Response) {
    try {
      const aktifFields = await GetPengaturanGajiAktifQuery.execute(); //
      res.status(200).json({
        message: "Berhasil mengambil pengaturan gaji aktif",
        aktif: aktifFields,
      });
    } catch (error) {
      res.status(500).json({
        error: "Gagal mengambil pengaturan gaji aktif",
        detail: (error as Error).message,
      });
    }
  }

  async save(req: Request, res: Response) {
    try {
      const { aktif } = req.body;

      if (!Array.isArray(aktif)) {
        return res.status(400).json({ error: "Parameter 'aktif' harus berupa array" }); //
      }

      // Fetch current fields BEFORE saving to correctly identify created/updated fields
      const fieldsBeforeSave = await GetPengaturanGajiAktifQuery.execute(); //

      await savePengaturanGajiAktifCommand.execute(aktif); //
      
      // Determine created fields by comparing input 'aktif' with 'fieldsBeforeSave'
      const createdFields = aktif.filter((newField: any) => 
        !fieldsBeforeSave.some((oldField: any) => oldField.field === newField.field)
      ); //

      // Determine updated fields by comparing input 'aktif' with 'fieldsBeforeSave'
      const updatedFields = aktif.filter((newField: any) => {
        const oldField = fieldsBeforeSave.find((old: any) => old.field === newField.field);
        return oldField && oldField.label !== newField.label; //
      });
      
      const logRepo = new SequelizeLogRepository(); //
      const createLog = new CreateLogCommand(logRepo); //
      const email = await getUserEmail(res.locals.id_user);
      
      for (const field of createdFields) {
        await createLog.execute({
          user_id: res.locals.id_user,
          email,
          action: "Membuat Pengaturan Gaji Aktif", //
          module: "Pengaturan Gaji Aktif", //
          description: buildLogDescription("Membuat Pengaturan Gaji Aktif", field.field), //
        });
      }
      
      for (const field of updatedFields) {
        const oldField = fieldsBeforeSave.find((old: any) => old.field === field.field);
        await createLog.execute({
          user_id: res.locals.id_user,
          email,
          action: "Perbarui Pengaturan Gaji Aktif", //
          module: "Pengaturan Gaji Aktif", //
          description: buildLogDescription(
            "Perbarui Pengaturan Gaji Aktif",
            `${field.field} dari "${oldField?.label || '-'}" ke "${field.label}"` //
          ),
        });
      }

      res.status(200).json({ message: "Pengaturan berhasil disimpan" }); //
    } catch (error) {
      res.status(500).json({
        error: "Gagal menyimpan pengaturan",
        detail: (error as Error).message,
      });
    }
  }
  
  async delete(req: Request, res: Response) {
    try {
      const { field } = req.params;
      if (!field) {
        return res.status(400).json({ error: "Field harus disediakan" }); //
      }
  
      await deletePengaturanGajiAktifCommand.execute(field); //
      
      const logRepo = new SequelizeLogRepository(); //
      const createLog = new CreateLogCommand(logRepo); //
      const email = await getUserEmail(res.locals.id_user);
      
      await createLog.execute({
        user_id: res.locals.id_user,
        email,
        action: "Hapus Pengaturan Gaji Aktif", //
        module: "Pengaturan Gaji Aktif", //
        description: buildLogDescription("Hapus Pengaturan Gaji Aktif", field), //
      });

      res.status(200).json({ message: "Field berhasil dihapus" }); //
    } catch (error) {
      res.status(500).json({
        error: "Gagal menghapus field",
        detail: (error as Error).message,
      });
    }
  }
}

export default new PengaturanGajiAktifController(); //