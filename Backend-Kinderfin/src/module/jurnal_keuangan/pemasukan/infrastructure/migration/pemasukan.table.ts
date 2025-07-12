import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../../config";

const pgDbConn = new PostgresDatabase().dbConn;

export const PemasukanModel = pgDbConn.define(
  'pemasukan',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    jenis_pemasukan: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Makanan",
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Makanan",
    },
    nominal: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "pemasukan",
    indexes: [
      {
        unique: false,
        fields: ["jenis_pemasukan", "nama"],
      },
    ]
  }
)