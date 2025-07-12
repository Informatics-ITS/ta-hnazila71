import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";

const pgDbConn = new PostgresDatabase().dbConn;

export const UserBillPaymentsModel = pgDbConn.define(
  "user_bill_payments",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    amount_paid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    component_paid: {
      type: DataTypes.ENUM("SPP", "KOMITE", "EKSTRAKULIKULER", "DAFTAR ULANG", "ALL"),
      allowNull: false,
      defaultValue: "SPP",
    },
    url_bukti_pembayaran: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    catatan: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_bill_payments",
    indexes: [{ unique: true, fields: ["id"] }],
  }
)