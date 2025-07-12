import { DataTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config";
import { UserRole } from "../../domain/enum";

const pgDbConn = new PostgresDatabase().dbConn;

export const UserModel = pgDbConn.define(
    "user",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        id_informasi_tambahan: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: DataTypes
                .UUIDV4,
        },

        // nip: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     defaultValue: "00000000001",
        // },
        // nama_lengkap: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     defaultValue: "Tim PIKTI",
        // },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "emailpikti@gmail.com",
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Default Password",
        },
        role: {
            type: DataTypes.ENUM(...Object.values(UserRole)),
            allowNull: false,
            defaultValue: UserRole.GURU,
        },
        // nama_bank: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     defaultValue: "Bank PIKTI",
        // },
        // pemilik_rekening: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     defaultValue: "Tim PIKTI",
        // },
        // nomor_rekening: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     defaultValue: "1234567890123",
        // },
        login_at: { type: DataTypes.DATE },
    },
    // {
    //     tableName: "users",
    //     indexes: [
    //         { unique: false, fields: ["nama_lengkap", "role"] },
    //         {
    //             unique: true,
    //             fields: ["nip", "email", "pemilik_rekening", "nomor_rekening"],
    //         },
    //     ],
    // },
    {
        tableName: "users",
        indexes: [
            { unique: false, fields: ["role"] },
            {
                unique: true,
                fields: ["email"],
            },
        ],
    },
    
);
