import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";

const pgDbConn = new PostgresDatabase().dbConn;

export const MasterDataModel = pgDbConn.define(
    "master_data",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        tipe: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Tipe Data Master",
        },
        nilai: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Nilai Data Master",
        },
        aturan: { type: DataTypes.STRING },
        deskripsi: { type: DataTypes.TEXT },
    },
    {
        tableName: "master_datas",
        indexes: [{ fields: ["tipe"] }],
    },
);
