import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";
import { SalaryStatus } from "../../domain/enum";

const pgDbConn = new PostgresDatabase().dbConn;

export const SalaryModel = pgDbConn.define(
    "gaji",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        nama_lengkap: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Tim PIKTI",
        },
        tanggal_pembayaran: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        nominal: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1000000,
        },
        status_pembayaran: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: SalaryStatus.PAID,
        },
    },
    {
        tableName: "salaries",
        indexes: [
            {
                fields: ["nama_lengkap", "tanggal_pembayaran", "id_user"],
            },
        ],
    },
);
