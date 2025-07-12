import { StatusCodes } from "http-status-codes";
import {
    ApplicationError,
    ICommandHandler,
} from "../../../../shared/abstract";
import { EventBus, logger } from "../../../../shared/util";
import { EmployeeSalaryDeletedEvent } from "../../domain/event";
import { ISalaryRepository } from "../../domain/repository";

export interface DeleteSalaryCommand {
    id: string;
}

export class DeleteSalaryCommandHandler
    implements ICommandHandler<DeleteSalaryCommand, void> {
    constructor(
        private readonly salaryRepository: ISalaryRepository,
        private readonly eventBus: EventBus,
    ) { }

    async execute(command: DeleteSalaryCommand): Promise<void> {
        try {
            const { id } = command;
            const oldSalary = await this.salaryRepository.isSalaryDataExist(
                id,
            );
            if (!oldSalary) {
                logger.error("salary data is not found");
                throw new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    "Data gaji tidak ditemukan",
                );
            }
            await this.salaryRepository.deleteSalary(
                id,
            );
            this.eventBus.publish(
                "EmployeeSalaryDeleted",
                new EmployeeSalaryDeletedEvent(
                    "success",
                    "EmployeeSalaryDeleted",
                ),
            );
            logger.info("salary data has been successfully deleted");
        } catch (error) {
            const appErr = error as ApplicationError;
            this.eventBus.publish("EmployeeSalaryDeleted", {
                data: {
                    status: "error",
                    code: appErr.code,
                    message: appErr.message,
                },
                eventName: "EmployeeSalaryDeleted",
            });
            logger.error("failed to delete old salary data");
        }
    }
}
