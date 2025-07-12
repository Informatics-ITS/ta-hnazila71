import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";

const pgDbConn = new PostgresDatabase().dbConn;

export const RumahTanggaModel = pgDbConn.define(
  'pengeluaran_rumah_tangga',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    jenis_pengeluaran: {
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
    tableName: "pengeluaran_rumah_tangga",
    indexes: [
      {
        unique: false,
        fields: ["jenis_pengeluaran", "nama"],
      },
    ]
  }
)