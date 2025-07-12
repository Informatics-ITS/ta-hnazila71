import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("pengaturan_gaji_aktif", {
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
    await queryInterface.dropTable("pengaturan_gaji_aktif");
  },
};
