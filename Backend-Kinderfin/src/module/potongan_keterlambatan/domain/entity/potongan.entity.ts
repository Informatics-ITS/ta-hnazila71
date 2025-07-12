import { DataTypes, Model } from "sequelize";
import { PostgresDatabase } from "../../../../config/database.config";

const dbConn = new PostgresDatabase().dbConn;

export class PotonganKeterlambatan extends Model {
  public id!: string;
  public jabatan!: string;
  public urutan_gaji_dipotong!: number;
  public persen_potong!: number;
  public batas_menit!: number; 
  public jenis_potongan!: string;
}

PotonganKeterlambatan.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    jabatan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    urutan_gaji_dipotong: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    persen_potong: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    batas_menit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    jenis_potongan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: dbConn,
    tableName: "potongan_keterlambatan",
  }
);
