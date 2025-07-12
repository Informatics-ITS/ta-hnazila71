import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";
import { UserRole } from "../../domain/enum";

const pgDbConn = new PostgresDatabase().dbConn;

export const GuruModel = pgDbConn.define(
  'teachers',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    nip: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "00000000001",
    },
    jabatan: {
      type: DataTypes.STRING, // Tipe data harus sesuai dengan PK di master_jabatan (VARCHAR(255) atau STRING)
      allowNull: true, // Sesuaikan dengan kebutuhan Anda, apakah guru selalu punya jabatan atau boleh null
      defaultValue: "Guru",
      references: {            // <--- TAMBAHAN KRUSIAL UNTUK FOREIGN KEY FISIK
        model: 'master_jabatan', // Nama tabel yang direferensikan
        key: 'jabatan',          // Nama kolom Primary Key di tabel master_jabatan
      },
      onUpdate: 'CASCADE',       // Opsional: Perilaku saat Primary Key di master_jabatan diupdate
      onDelete: 'RESTRICT',      // Opsional: Perilaku saat Primary Key di master_jabatan dihapus (RESTRICT, CASCADE, SET NULL)
    },
    nama_lengkap: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Kinderfin",
    },
    nama_bank: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Bank KINDERFIN",
    },
    pemilik_rekening: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Tim KINDERFIN",
    },
    nomor_rekening: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "1234567890123",
    },
  },
  {
    tableName: "teachers",
    timestamps: true, // Asumsikan Anda ingin created_at dan updated_at otomatis
    underscored: true, // Jika kolom otomatis ingin snake_case
    version: false, // Jika tidak menggunakan kolom versi
    indexes: [
      {
        unique: false,
        fields: ["nama_lengkap", "jabatan"],
      },
      {
        unique: true,
        fields: ["nip"],
      },
    ]
  }
);