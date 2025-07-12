import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";

const pgDbConn = new PostgresDatabase().dbConn;

export const BudgetEstimatePlanModel = pgDbConn.define(
    "rencana_anggaran_biaya",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        tahun: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2020,
        },
        aktivitas: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Aktivitas PIKTI",
        },
        sub_aktivitas: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Sub Aktivitas PIKTI",
        },
        jumlah: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1000000,
        },
    },
    {
        tableName: "budget_estimate_plans",
        indexes: [{ fields: ["tahun"] }],
    },
);
