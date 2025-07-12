import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("detail_salary", {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      teacher_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      nama_lengkap: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      jabatan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tanggal: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      gaji1final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      gaji2final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      gaji3final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      gaji4final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      gaji5final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      gaji6final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      gaji7final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      gaji8final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      gaji9final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      gaji10final: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      potongan_terlambat: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      potongan_datang_telat: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      potongan_pulang_cepat: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      potongan_tidak_absen_masuk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      potongan_tidak_absen_pulang: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      jam_masuk: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      jam_keluar: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      total_salary: {
        type: DataTypes.INTEGER,
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

    
    await queryInterface.addConstraint("detail_salary", {
      fields: ["teacher_id", "tanggal"],
      type: "unique",
      name: "unique_teacherid_tanggal_constraint",
    });
  },

  down: async (queryInterface: QueryInterface) => {
    
    await queryInterface.removeConstraint("detail_salary", "unique_teacherid_tanggal_constraint");
    await queryInterface.dropTable("detail_salary");
  },
};