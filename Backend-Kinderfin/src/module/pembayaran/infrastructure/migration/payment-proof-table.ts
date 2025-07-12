import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";

const pgDbConn = new PostgresDatabase().dbConn;

export const PaymentProofModel = pgDbConn.define(
    "bukti_pembayaran",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        // nomor_pendaftaran: { type: DataTypes.STRING },
        // tanggal_daftar: {
        //     type: DataTypes.DATE,
        //     allowNull: false,
        //     defaultValue: DataTypes.NOW,
        // },
        // nama_lengkap: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     defaultValue: "Pendaftar PIKTI",
        // },
        // jenis_pembayaran: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     defaultValue: "Jenis Pembayaran PIKTI",
        // },
        // nrp: { type: DataTypes.STRING },
        // email: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     defaultValue: "emailpendaftarpikti@gmail.com",
        // },
        // nomor_telepon: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     defaultValue: "012345678901",
        // },
    },
    {
        tableName: "payment_proofs",
        indexes: [{ unique: true, fields: ["nomor_pendaftaran"] }],
    },
);
