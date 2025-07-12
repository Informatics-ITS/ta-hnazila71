import { Sequelize } from "sequelize";
import { appConfig } from ".";
import { logger } from "../shared/util";
const dbConfig = appConfig.get("/pgDatabase");

export class PostgresDatabase {
    private dbUri: string;
    dbConn: Sequelize;

    constructor() {
        this.dbUri = dbConfig.uri;

        // Menambahkan opsi SSL dengan benar
        const sslConfig = appConfig.get("/appEnv") == "production"
            ? {
                ssl: {
                    require: true, // Mengaktifkan SSL
                    rejectUnauthorized: false, // Membolehkan koneksi meski sertifikat tidak divalidasi
                }
            }
            : {};

        this.dbConn = new Sequelize(this.dbUri, {
            dialect: "postgres",
            dialectOptions: sslConfig,
            define: {
                underscored: true,
                version: true,
                defaultScope: {
                    attributes: {
                        exclude: ["version", "createdAt", "updatedAt"],
                    },
                    raw: true,
                },
            },
            pool: {
                max: dbConfig.connPool.max,
                min: dbConfig.connPool.min,
                acquire: 30000,
                idle: 10000,
            },
            logging:
                appConfig.get("/appEnv") == "test"
                    ? false
                    : (msg) => logger.info(msg),
        });

        // Menguji koneksi dan sinkronisasi database
        this.dbConn
            .authenticate()
            .then(() => {
                logger.info("database connected");
            })
            .catch((error) => {
                logger.error(`unable to connect to the database: ${error}`);
            });

        this.dbConn
            .sync({ alter: true })
            .then(() => {
                logger.info("database synced");
            })
            .catch((error) => {
                logger.error(`unable to sync database: ${error}`);
            });
    }

    disconnect() {
        this.dbConn.close();
        logger.info("database disconnected");
    }
}
