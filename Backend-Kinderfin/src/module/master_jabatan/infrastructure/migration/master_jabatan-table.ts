import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("master_jabatan", {
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
    await queryInterface.dropTable("master_jabatan");
  },
};
