import { QueryTypes } from "sequelize";
import { PostgresDatabase } from "../../../../../config/database.config";
import { ActivityLogAttributes } from "../../../domain/entity/log.entity";
import { ActivityLog } from "../../../domain/entity/log.entity";
import { ActivityLogRepository as IActivityLogRepository } from "../../../domain/repository/log.repository";

const dbConn = new PostgresDatabase().dbConn;

export class SequelizeLogRepository implements IActivityLogRepository {
  async findAll(): Promise<ActivityLogAttributes[]> {
    const query = `
      SELECT id, user_id, email, action, module, description, created_at
      FROM activity_logs
      ORDER BY created_at DESC
    `;
    const result = await dbConn.query(query, { type: QueryTypes.SELECT });
    return result as ActivityLogAttributes[];
  }

  async findById(id: string): Promise<ActivityLogAttributes | null> {
    const query = `
      SELECT id, user_id, email, action, module, description, created_at
      FROM activity_logs
      WHERE id = :id
    `;
    const result = await dbConn.query(query, {
      type: QueryTypes.SELECT,
      replacements: { id },
    });

    return result[0] ? (result[0] as ActivityLogAttributes) : null;
  }

  async create(data: {
    user_id: string;
    email: string;
    action: string;
    module: string;
    description?: string;
  }): Promise<ActivityLogAttributes> {
    const result = await ActivityLog.create(data);
    return result.toJSON() as ActivityLogAttributes;
  }
}
//