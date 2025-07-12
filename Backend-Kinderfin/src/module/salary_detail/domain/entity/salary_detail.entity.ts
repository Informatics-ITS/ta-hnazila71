import { DataTypes, Model } from "sequelize";
import { PostgresDatabase } from "../../../../config/database.config";

const dbConn = new PostgresDatabase().dbConn;

export class SalaryDetail extends Model {
  public id!: string;
  public teacher_id!: string;
  public nama_lengkap!: string;
  public jabatan!: string;
  public tanggal!: string;

  public gaji1final!: number;
  public gaji2final!: number;
  public gaji3final!: number;
  public gaji4final!: number;
  public gaji5final!: number;
  public gaji6final!: number;
  public gaji7final!: number;
  public gaji8final!: number;
  public gaji9final!: number;
  public gaji10final!: number;

  public potongan_terlambat!: number;
  public potongan_datang_telat!: number;
  public potongan_pulang_cepat!: number;
  public potongan_tidak_absen_masuk!: number;
  public potongan_tidak_absen_pulang!: number;
  public jam_masuk!: string;
  public jam_keluar!: string;

  public total_salary!: number;
}

SalaryDetail.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    teacher_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    nama_lengkap: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jabatan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gaji1final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji2final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji3final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji4final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji5final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji6final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji7final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji8final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji9final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji10final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    potongan_terlambat: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    potongan_datang_telat: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    potongan_pulang_cepat: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    potongan_tidak_absen_masuk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    potongan_tidak_absen_pulang: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    jam_masuk: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    jam_keluar: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    total_salary: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: dbConn,
    tableName: "detail_salary",
    timestamps: true,
    underscored: true,
    version: false,
  }
);

export default SalaryDetail;