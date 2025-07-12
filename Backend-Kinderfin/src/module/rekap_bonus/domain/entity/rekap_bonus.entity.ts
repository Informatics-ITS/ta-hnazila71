import { DataTypes, Model } from "sequelize"; //
import { PostgresDatabase } from "../../../../config/database.config"; //

const dbConn = new PostgresDatabase().dbConn; //

export class RekapBonus extends Model { //
  public id!: string; //
  public tanggal!: string; //
  public start_date!: string; //
  public end_date!: string; //
  public teacher_id!: string; // Mengubah dari 'nip' ke 'teacher_id' dengan tipe UUID //
  public uang_tambahan!: number; //
  public keterangan!: string | null; //
}

RekapBonus.init(
  {
    id: {
      type: DataTypes.UUID, //
      primaryKey: true, //
      defaultValue: DataTypes.UUIDV4 //
    },
    tanggal: {
      type: DataTypes.DATEONLY, //
      allowNull: false //
    },
    start_date: {
      type: DataTypes.DATEONLY, //
      allowNull: false //
    },
    end_date: {
      type: DataTypes.DATEONLY, //
      allowNull: false //
    },
    teacher_id: { // Mengubah dari 'nip'
      type: DataTypes.UUID, // Mengubah tipe data ke UUID //
      allowNull: false //
    },
    uang_tambahan: {
      type: DataTypes.INTEGER, //
      allowNull: false, //
      defaultValue: 0 //
    },
    keterangan: {
      type: DataTypes.TEXT, //
      allowNull: true //
    }
  },
  {
    sequelize: dbConn, //
    tableName: "rekap_bonus", //
    timestamps: true, //
    underscored: true, //
    version: false //
  }
);

export default RekapBonus;