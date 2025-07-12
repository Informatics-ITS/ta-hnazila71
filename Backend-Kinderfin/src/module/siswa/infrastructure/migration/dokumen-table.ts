import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";

const pgDbConn = new PostgresDatabase().dbConn;


// id?: AggregateId;
// url_akta_kelahiran?: string;
// url_kartu_keluarga?: string;

export const DokumenModel = pgDbConn.define(
  "documents",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    url_akta_kelahiran: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "https://www.kinderfin.com/akta_kelahiran",
    },
    url_kartu_keluarga: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "https://www.kinderfin.com/kartu_keluarga",
    },
    ppdb_id: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "documents",
    indexes: [
      {
        unique: false,
        fields: ["url_akta_kelahiran", "url_kartu_keluarga"],
      },
    ]
  }
)