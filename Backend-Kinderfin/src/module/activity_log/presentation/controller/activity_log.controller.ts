import { Request, Response } from "express";
import { SequelizeLogRepository } from "../../infrastructure/storage/repository/sequelize-log.repository";
import { CreateLogCommand } from "../../application/command/create-log.command";

const repo = new SequelizeLogRepository();
const createCommand = new CreateLogCommand(repo);

export class ActivityLogController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, email, action, module, description } = req.body;

      const result = await createCommand.execute({
        user_id,
        email,
        action,
        module,
        description,
      });

      res.status(201).json({ message: "Log berhasil disimpan", data: result });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const all = await repo.findAll(); // Ini harus return array object biasa
      res.status(200).json(all);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
  
}
//
