import { ActivityLogAttributes } from "../entity/log.entity";

export interface ActivityLogRepository {
  findAll(): Promise<ActivityLogAttributes[]>;

  findById(id: string): Promise<ActivityLogAttributes | null>;

  create(data: {
    user_id: string;
    email: string;
    action: string;
    module: string;
    description?: string;
  }): Promise<ActivityLogAttributes>;
}
//
