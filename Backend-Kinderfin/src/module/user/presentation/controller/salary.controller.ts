import { ApplicationError } from "../../../../shared/abstract";
import { EventBus, logger } from "../../../../shared/util";
import {
    DeleteSalaryCommand,
    DeleteSalaryCommandHandler,
    InputSalaryCommand,
    InputSalaryCommandHandler,
    UpdateSalaryCommand,
    UpdateSalaryCommandHandler,
} from "../../application/command";
import { ISalaryQueryHandler } from "../../application/query";
import { SalaryDataRetrievedEvent } from "../../domain/event/salary-data-retrieved.event";
import { ISalaryRepository } from "../../domain/repository";
import {
    ISalaryAccessService,
    SalaryAccessService,
} from "../../domain/service";

export class SalaryController {
    private readonly salaryAccessService: ISalaryAccessService;

    constructor(
        private readonly salaryRepository: ISalaryRepository,
        private readonly salaryQueryHandler: ISalaryQueryHandler,
        private readonly eventBus: EventBus,
    ) {
        this.salaryAccessService = new SalaryAccessService();
        this.eventBus.subscribe(
            "PayEmployeeSalary",
            this.inputSalary.bind(this),
        );
        this.eventBus.subscribe(
            "SalaryDataRequested",
            this.sendSalaryData.bind(this),
        );
        this.eventBus.subscribe(
            "SalaryDataRequestedById",
            this.sendSalaryDataById.bind(this),
        );
        this.eventBus.subscribe(
            "UpdateEmployeeSalary",
            this.updateSalary.bind(this),
        );
        this.eventBus.subscribe(
            "CancelEmployeeSalary",
            this.deleteSalary.bind(this),
        );
    }

    async inputSalary(eventData: any): Promise<void> {
        const { nama_lengkap, tanggal_pembayaran, nominal, user_id } = eventData.data;
        logger.debug(`input salary data DI CONTROLLER: ${JSON.stringify(eventData.data)}`);
        const validData: InputSalaryCommand = {
            nama_lengkap,
            tanggal_pembayaran,
            nominal,
            user_id,
        };
        const inputSalaryHandler = new InputSalaryCommandHandler(
            this.salaryRepository,
            this.eventBus,
        );
        await inputSalaryHandler.execute(validData);
    }

    async sendSalaryData(eventData: any): Promise<void> {
        const { id_user, role, page, limit} = eventData.data;
        try {
            const salaries = await this.salaryQueryHandler.getAllSalaries(page, limit);
            this.eventBus.publish(
                "SalaryDataRetrieved",
                new SalaryDataRetrievedEvent(
                    salaries,
                    "SalaryDataRetrieved",
                ),
            );
            logger.info("salary data has been successfully retrieved");
            // logger.debug(`salary data: ${JSON.stringify(salaries)}`);
        } catch (error) {
            const appErr = error as ApplicationError;
            this.eventBus.publish("SalaryDataRetrieved", {
                data: {
                    status: "error",
                    code: appErr.code,
                    message: appErr.message,
                },
                eventName: "SalaryDataRetrieved",
            });
            logger.error("failed to get salary data");
        }
    }

    async sendSalaryDataById(eventData: any): Promise<void> {
        const { id_user, role, page, limit, user_id } = eventData.data;
        try {
            const salaries = await this.salaryQueryHandler.getSalariesById(page, limit, user_id);
            this.eventBus.publish(
                "SalaryDataByIdRetrieved",
                new SalaryDataRetrievedEvent(
                    salaries,
                    "SalaryDataByIdRetrieved",
                ),
            );
            logger.info("salary data by id has been successfully retrieved");
            // logger.debug(`salary data: ${JSON.stringify(salaries)}`);
        } catch (error) {
            const appErr = error as ApplicationError;
            this.eventBus.publish("SalaryDataRetrieved", {
                data: {
                    status: "error",
                    code: appErr.code,
                    message: appErr.message,
                },
                eventName: "SalaryDataRetrieved",
            });
            logger.error("failed to get salary data");
        }
    }

    async updateSalary(eventData: any): Promise<void> {
        const { id, nama_lengkap, tanggal_pembayaran, nominal, status_pembayaran, user_id } =
            eventData.data;
        try {
            const validData: UpdateSalaryCommand = {
                id: id,
                nama_lengkap: nama_lengkap,
                tanggal_pembayaran: tanggal_pembayaran,
                nominal: nominal,
                status_pembayaran: status_pembayaran,
            };
            const updateSalaryHandler = new UpdateSalaryCommandHandler(
                this.salaryRepository,
                this.eventBus,
            );
            await updateSalaryHandler.execute(validData);
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
            logger.error("failed to update salary data (USER)");
        }
    }

    async deleteSalary(eventData: any): Promise<void> {
        const { id } = eventData.data;
        const validData: DeleteSalaryCommand = {
            id,
        };
        const deleteSalaryHandler = new DeleteSalaryCommandHandler(
            this.salaryRepository,
            this.eventBus,
        );
        await deleteSalaryHandler.execute(validData);
    }
}
