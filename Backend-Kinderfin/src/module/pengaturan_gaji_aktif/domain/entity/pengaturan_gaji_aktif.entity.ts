import { DataTypes, Model } from "sequelize";
import { PostgresDatabase } from "../../../../config/database.config";

const dbConn = new PostgresDatabase().dbConn;

export class PengaturanGajiAktif extends Model {
  public id!: number;
  public field!: string;
  public label!: string | null;  
  public type!: string | null;   
  public aktif!: boolean;        
}

PengaturanGajiAktif.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    field: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    aktif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize: dbConn,
    tableName: "pengaturan_gaji_aktif",
    timestamps: true,
    underscored: true,
    version: false,
  }
);

export default PengaturanGajiAktif;
