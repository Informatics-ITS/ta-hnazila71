import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";

const pgDbConn = new PostgresDatabase().dbConn;

export const SPPModel = pgDbConn.define(
  "spp",
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
      defaultValue: "SPP",
    },
    biaya_spp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    biaya_komite: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    biaya_ekstrakulikuler: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    bulan: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Januari",
    },
    tahun_ajaran: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "2024",
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, 
  {
    tableName: "spp",
    indexes: [{ unique: true, fields: ["nama"] }],
  }
)