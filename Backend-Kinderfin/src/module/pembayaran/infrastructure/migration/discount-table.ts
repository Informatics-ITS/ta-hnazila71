import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";

const pgDbConn = new PostgresDatabase().dbConn;

export const DiscountModel = pgDbConn.define(
  "discount",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Discount",
    },
    persentase: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "discount",
    indexes: [{ unique: true, fields: ["nama"] }],
  }
);