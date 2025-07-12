import { StatusCodes } from "http-status-codes";
import {
    AggregateId,
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import { EventBus, logger } from "../../../../../shared/util";
import { SalaryCancelledEvent } from "../../domain/event";
import { IFundUsageRepository } from "../../domain/repository";

const regexHR: RegExp = /HR|Honorarium/;

export interface DeleteFundUsageCommand {
    id: AggregateId;
    tanggal?: Date;
    penerima?: string;
}

export class DeleteFundUsageCommandHandler
    implements ICommandHandler<DeleteFundUsageCommand, void>
{
    constructor(
        private readonly fundUsageRepository: IFundUsageRepository,
        private readonly eventBus: EventBus,
    ) {}

    async execute(command: DeleteFundUsageCommand): Promise<void> {
        const { id } = command;
        try {
            const oldFundUsage =
                await this.fundUsageRepository.isFundUsageIdExist(id);
            if (!oldFundUsage) {
                logger.error("fund usage data is not found");
                throw new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    "Data penggunaan dana tidak ditemukan",
                );
            }
            [command.tanggal, command.penerima] = [
                oldFundUsage.tanggal!,
                oldFundUsage.penerima!,
            ];
            if (regexHR.test(oldFundUsage.sub_aktivitas!)) {
                this.eventBus.removeSpecificListener("EmployeeSalaryDeleted");
                this.eventBus.publish(
                    "CancelEmployeeSalary",
                    new SalaryCancelledEvent(command, "CancelEmployeeSalary"),
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
            }
            await this.fundUsageRepository.deleteFundUsage(id);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
