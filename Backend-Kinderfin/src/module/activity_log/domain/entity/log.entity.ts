import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config/database.config";

const db = new PostgresDatabase().dbConn;

export interface ActivityLogAttributes {
    id?: string;
    user_id: string;
    email: string;
    action: string;
    module: string;
    description?: string;
    created_at?: Date;
  }
  
export const ActivityLog = db.define("activity_logs", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  module: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "activity_logs",
  timestamps: false,
});
//