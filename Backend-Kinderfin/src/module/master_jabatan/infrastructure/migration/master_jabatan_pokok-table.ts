import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("master_jabatan_pokok", {
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
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("master_jabatan_pokok");
  },
};
