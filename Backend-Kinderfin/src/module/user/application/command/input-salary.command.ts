import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus, logger } from "../../../../shared/util";
import { SalaryEntity, SalaryProps } from "../../domain/entity";
import {
    EmployeeSalaryPaidEvent,
    UserDataRequestedEvent,
} from "../../domain/event";
import { ISalaryRepository } from "../../domain/repository";

export interface InputSalaryCommand {
    nama_lengkap: string;
    tanggal_pembayaran: Date;
    nominal: number;
    user_id: string;
}

export class InputSalaryCommandHandler
    implements ICommandHandler<InputSalaryCommand, void>
{
    constructor(
        private readonly salaryRepository: ISalaryRepository,
        private readonly eventBus: EventBus,
    ) { }
    
    async execute(command: InputSalaryCommand): Promise<void> {
        try {
            const newSalary = new SalaryEntity<SalaryProps>(command);
            await this.salaryRepository.addSalary(newSalary);
            this.eventBus.publish(
                "EmployeeSalaryPaid",
                new EmployeeSalaryPaidEvent("success", "EmployeeSalaryPaid"),
            );
            logger.info("salary data has been successfully inputted");
        } catch (error) {
            const appErr = error as ApplicationError;
            this.eventBus.publish("EmployeeSalaryPaid", {
                data: {
                    status: "error",
                    code: appErr.code,
                    message: appErr.message,
                },
                eventName: "EmployeeSalaryPaid",
            });
            logger.error("failed to input salary data");
        }
    }

    // async execute(command: InputSalaryCommand): Promise<void> {
    //     this.eventBus.removeSpecificListener("UserDataByFullNameRetrieved");
    //     this.eventBus.publish(
    //         "UserDataRequestedByFullName",
    //         new UserDataRequestedEvent(command, "UserDataRequestedByFullName"),
    //     );
    //     this.eventBus.subscribe(
    //         "UserDataByFullNameRetrieved",
    //         async (userData: any): Promise<void> => {
    //             try {
    //                 if (userData.data.status == "error") {
    //                     throw new ApplicationError(
    //                         userData.data.code,
    //                         userData.data.message,
    //                     );
    //                 }
    //                 const newSalary = new SalaryEntity<SalaryProps>({
    //                     ...command,
    //                     user_id: userData.data.id,
    //                 } as SalaryProps);
    //                 await this.salaryRepository.addSalary(newSalary);
    //                 this.eventBus.publish(
    //                     "EmployeeSalaryPaid",
    //                     new EmployeeSalaryPaidEvent(
    //                         "success",
    //                         "EmployeeSalaryPaid",
    //                     ),
    //                 );
    //                 logger.info("salary data has been successfully inputted");
    //             } catch (error) {
    //                 const appErr = error as ApplicationError;
    //                 this.eventBus.publish("EmployeeSalaryPaid", {
    //                     data: {
    //                         status: "error",
    //                         code: appErr.code,
    //                         message: appErr.message,
    //                     },
    //                     eventName: "EmployeeSalaryPaid",
    //                 });
    //                 logger.error("failed to input salary data");
    //             }
    //         },
    //     );
    // }
}
