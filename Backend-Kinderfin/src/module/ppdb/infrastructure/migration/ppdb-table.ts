import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";
import { Gender } from "../../../siswa/domain/enum/gender.enum";

const pgDbConn = new PostgresDatabase().dbConn;

export const PPDBModel = pgDbConn.define(
  'ppdb',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    nik: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "1234567890",
    },
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
    tempat_lahir: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Jakarta",
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
    kelas: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "1",
    },
    url_file_akta: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url_file_kk: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_verified: {
      // type: DataTypes.STRING,
      type: DataTypes.ENUM("Belum Terverifikasi", "Sedang Diverifikasi", "Terverifikasi", "Ditolak"),
      allowNull: false,
      defaultValue: "Belum Terverifikasi",
    },
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "",
    },
    tahun_ajaran: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "2024",
    },
  },
  {
    tableName: "ppdb",
    indexes: [
      {
        unique: false,
        fields: ["nama_lengkap", "kelas"],
      },
    ]
  }
)