import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";

const pgDbConn = new PostgresDatabase().dbConn;


export const DaftarUlangModel = pgDbConn.define(
  "daftar_ulang",
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
      defaultValue: "Daftar Ulang",
    },
    biaya_perlengkapan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    biaya_kegiatan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    semester: {
      type: DataTypes.ENUM("Ganjil", "Genap"),
      allowNull: false,
      defaultValue: "Ganjil",
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
    tableName: "daftar_ulang",
    indexes: [{ unique: true, fields: ["nama"] }],
  }
)