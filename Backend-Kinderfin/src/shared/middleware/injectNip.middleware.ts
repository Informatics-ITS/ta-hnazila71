import { Request, Response, NextFunction } from "express";
import { PostgresDatabase } from "../../config/database.config";
import { QueryTypes } from "sequelize";

const dbConn = new PostgresDatabase().dbConn;

export const injectNip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idUser = res.locals.id_user;

    const [user] = await dbConn.query(
      `SELECT t.nip FROM users u
       LEFT JOIN teachers t ON u.id_informasi_tambahan = t.id
       WHERE u.id = :id LIMIT 1`,
      {
        replacements: { id: idUser },
        type: QueryTypes.SELECT,
      }
    );

    res.locals._nip = (user as any)?.nip || "unknown_user";
    next();
  } catch (error) {
    return res.status(500).json({ error: "Gagal inject NIP", detail: (error as Error).message });
  }
};
