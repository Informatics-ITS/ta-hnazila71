import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../../config";

const pgDbConn = new PostgresDatabase().dbConn;

export const BalanceSheetPostModel = pgDbConn.define(
    "pos_neraca",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        tahun_pos_neraca: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2020,
        },
        saldo_tahun_lalu: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1000000,
        },
        saldo_penerimaan_program_reguler: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1000000,
        },
        saldo_kerja_sama: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1000000,
        },
        kas: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 3000000,
        },
        piutang_usaha: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1000000,
        },
        inventaris: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1000000,
        },
        penyusutan_inventaris: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 100000,
        },
        pendapatan_yang_belum_diterima: { type: DataTypes.INTEGER },
        hutang_usaha: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1000000,
        },
        hutang_bank: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1000000,
        },
        laba_ditahan: { type: DataTypes.INTEGER },
    },
    {
        tableName: "balance_sheet_posts",
        indexes: [{ unique: true, fields: ["tahun_pos_neraca"] }],
    },
);
