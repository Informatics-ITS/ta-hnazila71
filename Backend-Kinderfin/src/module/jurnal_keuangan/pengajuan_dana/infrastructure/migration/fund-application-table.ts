import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../../config";

const pgDbConn = new PostgresDatabase().dbConn;

export const FundApplicationModel = pgDbConn.define(
    "pengajuan_dana",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        bulan: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
        tahun: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2023,
        },
        deskripsi: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "Deskripsi Pengajuan Dana",
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Unit Pengajuan Dana",
        },
        quantity_1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        quantity_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        harga_satuan: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 50000,
        },
        jumlah: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 50000,
        },
    },
    {
        tableName: "fund_applications",
        indexes: [{ fields: ["bulan", "tahun"] }],
        defaultScope: {
            attributes: {
                exclude: [
                    "bulan",
                    "tahun",
                    "version",
                    "createdAt",
                    "updatedAt",
                ],
            },
            raw: true,
        },
    },
);
