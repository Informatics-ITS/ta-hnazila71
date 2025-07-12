import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";
import { PaymentType } from "../../domain/enum";

const pgDbConn = new PostgresDatabase().dbConn;

export const PaymentTypeModel = pgDbConn.define(
  "payment_types",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(PaymentType)),
      allowNull: false,
      defaultValue: PaymentType.SPP,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Tunai",
    },
    rules: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    nomor_rekening: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "012345678901",
    },
  },
  {
    tableName: "payment_types",
  }
);