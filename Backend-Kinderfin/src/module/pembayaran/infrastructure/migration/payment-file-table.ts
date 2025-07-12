import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";

const pgDbConn = new PostgresDatabase().dbConn;

export const PaymentFileModel = pgDbConn.define(
    "file_pembayaran",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            defaultValue: "n5j3k2n5j78k3j3bn1k6jj4k",
        },
        nama: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "File Pembayaran PIKTI",
        },
        url_asli: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "http://url-link.com",
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Url Path",
        },
    },
    {
        tableName: "payment_files",
        indexes: [{ unique: true, fields: ["url_asli", "path"] }],
    },
);
