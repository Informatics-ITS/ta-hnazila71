// pengajuan_perubahan_gaji.entity.ts
import { DataTypes, Model } from "sequelize";
import { PostgresDatabase } from "../../../../config/database.config";

const dbConn = new PostgresDatabase().dbConn;

export class PengajuanPerubahanGaji extends Model {
  public id!: string;
  public user_id!: string; // Mengubah dari email ke user_id
  public foto_bukti_path!: string;
  public foto_gaji_path!: string;
  public keterangan!: string;
  public tanggal!: string;
  public status!: string;
  public approved_by?: string;
  public approved_at?: Date;
  public rejection_reason?: string;
}

PengajuanPerubahanGaji.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: { // Mengubah dari email ke user_id
      type: DataTypes.UUID, // Tipe data menjadi UUID
      allowNull: false,
    },
    foto_bukti_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    foto_gaji_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    approved_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: dbConn,
    tableName: "pengajuan_perubahan_gaji",
    timestamps: true,
    underscored: true,
    version: false,
  }
);

export default PengajuanPerubahanGaji;