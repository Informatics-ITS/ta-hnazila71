import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("potongan_keterlambatan", {
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
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("potongan_keterlambatan");
  },
};
