import { DataTypes, Model } from "sequelize";
import { PostgresDatabase } from "../../../../config/database.config";

const dbConn = new PostgresDatabase().dbConn;

export class MasterJabatanPokok extends Model {
  public jabatan!: string;
  public gaji_pokok1!: number;
  public gaji_pokok2!: number;
  public gaji_pokok3!: number;
  public gaji_pokok4!: number;
  public gaji_pokok5!: number;
  public gaji_pokok6!: number;
  public gaji_pokok7!: number;
  public gaji_pokok8!: number;
  public gaji_pokok9!: number;
  public gaji_pokok10!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

MasterJabatanPokok.init(
  {
    jabatan: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    gaji_pokok1: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji_pokok2: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji_pokok3: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji_pokok4: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji_pokok5: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji_pokok6: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji_pokok7: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji_pokok8: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji_pokok9: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji_pokok10: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "master_jabatan_pokok",
    sequelize: dbConn,
    timestamps: true,
    version: false
  }
);

export default MasterJabatanPokok;