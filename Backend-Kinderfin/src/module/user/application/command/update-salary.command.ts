import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus, logger } from "../../../../shared/util";
import { SalaryEntity, SalaryProps } from "../../domain/entity";
import { SalaryStatus } from "../../domain/enum";
import {
    EmployeeSalaryUpdatedEvent,
    UserDataRequestedEvent,
} from "../../domain/event";
import { ISalaryRepository } from "../../domain/repository";

export interface UpdateSalaryCommand {
    id: string;
    nama_lengkap: string;
    tanggal_pembayaran: Date;
    nominal: number;
    status_pembayaran?: SalaryStatus;
}

export class UpdateSalaryCommandHandler
    implements ICommandHandler<UpdateSalaryCommand, void>
{
    constructor(
        private readonly salaryRepository: ISalaryRepository,
        private readonly eventBus: EventBus,
    ) { }
    
    async execute(command: UpdateSalaryCommand): Promise<void> {
        try {
            const { id, nama_lengkap, tanggal_pembayaran, nominal, status_pembayaran } = command;
            const oldSalary = await this.salaryRepository.isSalaryDataExist(id);
            const user_id = JSON.parse(JSON.stringify(oldSalary)).id_user;
            if (!oldSalary) {
                logger.error("salary data is not found");
                throw new ApplicationError(
                    404,
                    "Data gaji tidak ditemukan",
                );
            }
            const salaryData = new SalaryEntity<SalaryProps>({
                ...command,
                user_id: user_id,
            } as SalaryProps);
            await this.salaryRepository.updateSalary(
                salaryData,
                oldSalary,
            );
            this.eventBus.publish(
                "EmployeeSalaryUpdated",
                new EmployeeSalaryUpdatedEvent(
                    "success",
                    "EmployeeSalaryUpdated",
                ),
            );
            logger.info("salary data has been successfully updated");
        } catch (error) {
            const appErr = error as ApplicationError;
            this.eventBus.publish("EmployeeSalaryUpdated", {
                data: {
                    status: "error",
                    code: appErr.code,
                    message: appErr.message,
                },
                eventName: "EmployeeSalaryUpdated",
            });
            logger.error("failed to update salary data");
        }
    }

    // async execute(command: UpdateSalaryCommand): Promise<void> {
    //     const { id, nama_lengkap, tanggal_pembayaran, nominal, status_pembayaran } = command;
    //     this.eventBus.removeSpecificListener("UserDataByFullNameRetrieved");
    //     this.eventBus.publish(
    //         "UserDataRequestedByFullName",
    //         new UserDataRequestedEvent(command, "UserDataRequestedByFullName"),
    //     );
    //     await this.eventBus.subscribe(
    //         "UserDataByFullNameRetrieved",
    //         async (userData: any): Promise<void> => {
    //             try {
    //                 if (userData.data.status == "error") {
    //                     throw new ApplicationError(
    //                         userData.data.code,
    //                         userData.data.message,
    //                     );
    //                 }
    //                 const oldSalary =
    //                     await this.salaryRepository.isSalaryDataExist(
    //                         id,
    //                     );
    //                 const salaryData = new SalaryEntity<SalaryProps>({
    //                     ...command,
    //                     user_id: userData.data.id,
    //                 } as SalaryProps);
    //                 await this.salaryRepository.updateSalary(
    //                     salaryData,
    //                     oldSalary,
    //                 );
    //                 this.eventBus.publish(
    //                     "EmployeeSalaryUpdated",
    //                     new EmployeeSalaryUpdatedEvent(
    //                         "success",
    //                         "EmployeeSalaryUpdated",
    //                     ),
    //                 );
    //                 logger.info("salary data has been successfully updated");
    //             } catch (error) {
    //                 const appErr = error as ApplicationError;
    //                 this.eventBus.publish("EmployeeSalaryUpdated", {
    //                     data: {
    //                         status: "error",
    //                         code: appErr.code,
    //                         message: appErr.message,
    //                     },
    //                     eventName: "EmployeeSalaryUpdated",
    //                 });
    //                 logger.error("failed to update salary data");
    //             }
    //         },
    //     );
    // }
}
