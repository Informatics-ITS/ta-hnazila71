import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";
import { UserRole } from "../../domain/enum";

const pgDbConn = new PostgresDatabase().dbConn;

export const OrangTuaModel = pgDbConn.define(
  'parents',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    ayah: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Ayah",
    },
    pekerjaan_ayah: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Pekerjaan Ayah",
    },
    ibu: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Ibu",
    },
    pekerjaan_ibu: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Pekerjaan Ibu",
    },
    alamat: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Alamat",
    },
    no_telepon: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "08123456789",
    },
  },
  {
    tableName: "parents",
    indexes: [
      {
        unique: false,
        fields: ["ayah", "ibu"],
      },
    ]
  }
)