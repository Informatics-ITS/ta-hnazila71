import winston from "winston";
import { LoadEnvs } from "../filler";

LoadEnvs();

const logFormat = () => {
    return winston.format.printf(
        (info) => `[${info.timestamp}] [${info.level}]: ${info.message}`,
    );
};

const InitLogger = (): winston.Logger => {
    return winston.createLogger({
        level: process.env.LOGGING_LEVEL ?? "debug",
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.splat(),
            winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
            logFormat(),
        ),
        transports: [new winston.transports.Console()],
    });
};

export const logger = InitLogger();
