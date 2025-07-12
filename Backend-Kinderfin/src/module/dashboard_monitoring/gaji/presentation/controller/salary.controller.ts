import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
    ApplicationError,
    DefaultMessage,
} from "../../../../../shared/abstract";
import {
    EventBus,
    buildResponseError,
    buildResponseSuccess,
    logger,
    validate,
} from "../../../../../shared/util";
import { MonitorSalaryApplicationService } from "../../application/query";
import { inputSalarySchema, monitorAllSalariesSchema, monitorSalaryByIdSchema, deleteSalarySchema, updateSalarySchema } from "../mapper";
import { SalaryPaidEvent } from "../../domain/event/salary-paid.event";
import { SalaryCancelledEvent } from "../../domain/event/salary-cancelled.event";
import { SalaryUpdatedEvent } from "../../domain/event/salary-updated.event";

export class SalaryController {
    constructor(private readonly eventBus: EventBus) { }

    async monitorAllSalaries(req: Request, res: Response): Promise<void> {
        const [page, limit, user_id] = [req.query.page, req.query.limit, req.query.user_id];
        const [id, role] = [res.locals.id_user, res.locals.role];
        try {
            if (user_id) {
                const validData: any = validate(
                    { id, role, user_id },
                    monitorSalaryByIdSchema,
                );
                const monitorSalaryApplicationService =
                    new MonitorSalaryApplicationService(this.eventBus);
                const salaries =
                    await monitorSalaryApplicationService.retrieveSalaryDataById(
                        validData.role,
                        validData.user_id,
                    );
                logger.info("all salary data by id has been successfully retrieved");
                // logger.debug(`all salary data: ${JSON.stringify(res.locals)}`);
                buildResponseSuccess(
                    res,
                    StatusCodes.OK,
                    DefaultMessage.SUC_AGET,
                    salaries,
                );
            }
            else {
                const validData: any = validate(
                    { id, role },
                    monitorAllSalariesSchema,
                );
                const monitorSalaryApplicationService =
                    new MonitorSalaryApplicationService(this.eventBus);
                const salaries =
                    await monitorSalaryApplicationService.retrieveSalaryData(
                        validData.id,
                        validData.role,
                    );
                logger.info("all salary data has been successfully retrieved");
                // logger.debug(`all salary data: ${JSON.stringify(res.locals)}`);
                buildResponseSuccess(
                    res,
                    StatusCodes.OK,
                    DefaultMessage.SUC_AGET,
                    salaries,
                );
            }
        } catch (error) {
            logger.error("failed to get all salary data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async inputSalary(req: Request, res: Response): Promise<void> {
        const { body } = req;
        try {
            const validData: any = validate(
                body,
                inputSalarySchema,
            );
            this.eventBus.removeSpecificListener("EmployeeSalaryPaid");
            this.eventBus.publish(
                "PayEmployeeSalary",
                new SalaryPaidEvent(validData, "PayEmployeeSalary"),
            );
            await new Promise<void>((resolve, reject) => {
                this.eventBus.subscribe(
                    "EmployeeSalaryPaid",
                    async (salaryData: any) => {
                        try {
                            if (salaryData.data.status == "error") {
                                throw new ApplicationError(
                                    salaryData.data.code,
                                    salaryData.data.message,
                                );
                            }
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    },
                );
            });
            logger.info("salary data has been successfully inputted");
            buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_ADD);
        } catch (error) {
            logger.error("failed to input salary data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async deleteSalary(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const validData = validate(
                { id },
                deleteSalarySchema,
            );
            this.eventBus.removeSpecificListener("EmployeeSalaryDeleted");
            this.eventBus.publish(
                "CancelEmployeeSalary",
                new SalaryCancelledEvent(validData, "CancelEmployeeSalary"),
            );
            await new Promise<void>((resolve, reject) => {
                this.eventBus.subscribe(
                    "EmployeeSalaryDeleted",
                    async (salaryData: any) => {
                        try {
                            if (salaryData.data.status == "error") {
                                throw new ApplicationError(
                                    salaryData.data.code,
                                    salaryData.data.message,
                                );
                            }
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    },
                );
            });
            logger.info("salary data has been successfully removed");
            buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_DEL);
        } catch (error) {
            logger.error("failed to delete salary data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async updateSalary(req: Request, res: Response): Promise<void> {
        const { body } = req;
        body["id"] = req.params.id;
        try {
            const validData = validate(
                body,
                updateSalarySchema,
            );
            this.eventBus.removeSpecificListener("EmployeeSalaryUpdated");
            this.eventBus.publish(
                "UpdateEmployeeSalary",
                new SalaryUpdatedEvent(validData, "UpdateEmployeeSalary"),
            );
            await new Promise<void>((resolve, reject) => {
                this.eventBus.subscribe(
                    "EmployeeSalaryUpdated",
                    async (salaryData: any) => {
                        try {
                            if (salaryData.data.status == "error") {
                                throw new ApplicationError(
                                    salaryData.data.code,
                                    salaryData.data.message,
                                );
                            }
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    },
                );
            });
            logger.info("salary data has been successfully updated");
            buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_UPDT);
        } catch (error) {
            logger.error("failed to update salary data (GAJI)");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

}
