import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../../config";

const pgDbConn = new PostgresDatabase().dbConn;

export const FundUsageModel = pgDbConn.define(
    "penggunaan_dana",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        aktivitas: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Aktivitas PIKTI",
        },
        tanggal: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        penerima: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Penerima Penggunaan Dana",
        },
        sub_aktivitas: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Sub Aktivitas PIKTI",
        },
        uraian: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "Uraian Penggunaan Dana",
        },
        jumlah: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1000000,
        },
    },
    {
        tableName: "fund_usages",
    },
);
