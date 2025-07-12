import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";
import { Gender } from "../../domain/enum/gender.enum";

const pgDbConn = new PostgresDatabase().dbConn;

export const SiswaModel = pgDbConn.define(
  'students',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    // id_orang_tua: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    nama_lengkap: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Kinderfin",
    },
    tanggal_lahir: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(),
    },
    alamat: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Jl. Kinderfin No. 1",
    },
    jenis_kelamin: {
      type: DataTypes.ENUM(...Object.values(Gender)),
      allowNull: false,
      defaultValue: Gender.LAKI_LAKI,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Aktif",
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "1",
    },
  },
  {
    tableName: "students",
    indexes: [
      {
        unique: false,
        fields: ["nama_lengkap", "grade"],
      },
    ]
  }
)