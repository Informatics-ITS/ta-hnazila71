import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";

const pgDbConn = new PostgresDatabase().dbConn;

export const StudentBillsModel = pgDbConn.define(
  "student_bills",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    id_tagihan: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
    },
    total_paid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    remaining_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    payment_status: {
      type: DataTypes.ENUM("LUNAS", "GAGAL", "BELUM LUNAS"),
      allowNull: false,
      defaultValue: "BELUM LUNAS",
    },
  },
  {
    tableName: "student_bills",
  }
)