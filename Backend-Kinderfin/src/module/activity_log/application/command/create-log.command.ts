import { QueryTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config/database.config";
import { ActivityLogRepository } from "../../domain/repository/log.repository";

const dbConn = new PostgresDatabase().dbConn;

export class CreateLogCommand {
  constructor(private readonly repo: ActivityLogRepository) {}

  async execute(data: {
    user_id: string;
    email: string;
    action: string;      
    module: string;      
    description?: string;
  }) {
    const { user_id, email, action, module, description } = data;

    
    if (!user_id || !email) {
      throw new Error("User ID dan email wajib diisi.");
    }

    
    const result = await this.repo.create({
      user_id,
      email,
      action,
      module,
      description,
    });

    return result;
  }
}
//