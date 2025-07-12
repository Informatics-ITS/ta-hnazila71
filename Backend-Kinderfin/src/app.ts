import { seedDatabase } from "./config";
import { AppServer } from "./server";
import { logger } from "./shared/util";

const server = new AppServer();
setTimeout(() => {}, 1500);

try {
    const srv = server.app.listen(server.port, () => {
        logger.info(`server running on http://localhost:${server.port}`);
    });
    seedDatabase(server.pgDatabase.dbConn);

    process.on("SIGINT", () => {
        logger.info("signal SIGINT received");
        server.gracefulShutdown(srv);
    });

    process.on("SIGTERM", () => {
        logger.info("signal SIGTERM received");
        server.gracefulShutdown(srv);
    });
} catch (error) {
    logger.error(`error running server: ${error}`);
    process.exit(1);
}
