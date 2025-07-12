import { DataTypes, Model } from "sequelize";
import { PostgresDatabase } from "../../../../config/database.config";

const dbConn = new PostgresDatabase().dbConn;

export class MasterJabatan extends Model {
  public jabatan!: string;
  public gaji1!: number;
  public gaji2!: number;
  public gaji3!: number;
  public gaji4!: number;
  public gaji5!: number;
  public gaji6!: number;
  public gaji7!: number;
  public gaji8!: number;
  public gaji9!: number;
  public gaji10!: number;
}

MasterJabatan.init(
  {
    jabatan: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    gaji1: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji2: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji3: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji4: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji5: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji6: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji7: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji8: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji9: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    gaji10: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize: dbConn,
    tableName: "master_jabatan",
    timestamps: true,
    underscored: true,
    version: false, 
  }
);

export default MasterJabatan;
