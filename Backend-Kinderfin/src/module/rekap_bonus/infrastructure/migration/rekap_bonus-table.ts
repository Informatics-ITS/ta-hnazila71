import { DataTypes, QueryInterface } from "sequelize"; //

module.exports = {
  up: async (queryInterface: QueryInterface) => { //
    await queryInterface.createTable("rekap_bonus", { //
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
        allowNull: false, //
        references: { // Menambahkan referensi Foreign Key
          model: "teachers", // Nama tabel yang direferensikan
          key: "id" // Primary Key dari tabel teachers
        },
        onUpdate: "CASCADE", // Opsi ON UPDATE CASCADE
        onDelete: "CASCADE" // Opsi ON DELETE CASCADE
      },
      uang_tambahan: {
        type: DataTypes.INTEGER, //
        allowNull: false, //
        defaultValue: 0 //
      },
      keterangan: {
        type: DataTypes.TEXT, //
        allowNull: true //
      },
      created_at: {
        type: DataTypes.DATE, //
        allowNull: false, //
        defaultValue: DataTypes.NOW //
      },
      updated_at: {
        type: DataTypes.DATE, //
        allowNull: false, //
        defaultValue: DataTypes.NOW //
      }
    });
  },

  down: async (queryInterface: QueryInterface) => { //
    await queryInterface.dropTable("rekap_bonus"); //
  }
};