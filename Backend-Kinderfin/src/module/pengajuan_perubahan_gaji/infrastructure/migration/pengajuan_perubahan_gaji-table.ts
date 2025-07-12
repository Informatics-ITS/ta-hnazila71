import { DataTypes, QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('pengajuan_perubahan_gaji', 'status', {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    });

    await queryInterface.addColumn('pengajuan_perubahan_gaji', 'approved_by', {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('pengajuan_perubahan_gaji', 'approved_at', {
      type: DataTypes.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('pengajuan_perubahan_gaji', 'rejection_reason', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('pengajuan_perubahan_gaji', 'status');
    await queryInterface.removeColumn('pengajuan_perubahan_gaji', 'approved_by');
    await queryInterface.removeColumn('pengajuan_perubahan_gaji', 'approved_at');
    await queryInterface.removeColumn('pengajuan_perubahan_gaji', 'rejection_reason');
  },
};