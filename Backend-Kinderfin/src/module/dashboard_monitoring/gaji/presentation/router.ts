import express, { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { Sequelize } from "sequelize";
import { middlewareAuthentication } from "../../../../shared/middleware";
import { EventBus, logger } from "../../../../shared/util";
import { SalaryController } from "./controller";

export const setSalaryRoutes = (
    dbConn: Sequelize,
    eventBus: EventBus,
): Router => {

    const salaryController = new SalaryController(
        eventBus,
    );
    const salaryRouter = express.Router();

    salaryRouter.use(middlewareAuthentication);

    salaryRouter.get(
        "",
        expressAsyncHandler(
            salaryController.monitorAllSalaries.bind(salaryController),
        ),
    );

    salaryRouter.post(
        "",
        expressAsyncHandler(
            salaryController.inputSalary.bind(salaryController),
        ),
    );

    salaryRouter.delete(
        "/:id",
        expressAsyncHandler(
            salaryController.deleteSalary.bind(salaryController),
        ),
    );

    salaryRouter.put(
        "/:id",
        expressAsyncHandler(
            salaryController.updateSalary.bind(salaryController),
        ),
    );

    return salaryRouter;
};
