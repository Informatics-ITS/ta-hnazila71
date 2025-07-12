import { AggregateId, ApplicationError } from "../../../../../shared/abstract";
import { EventBus, logger } from "../../../../../shared/util";
import { SalaryHistoryEntity, SalaryHistoryProps } from "../../domain/entity";
import { GuruEntity } from "../../../../user/domain/entity/guru.entity";
import { MasterJabatan } from "../../../../master_jabatan/domain/entity/master_jabatan.entity";
import { SalaryDataRequestedEvent } from "../../domain/event";
import {
    ISalaryFilterService,
    SalaryFilterService,
} from "../../domain/service";

export interface IMonitorSalaryApplicationService {
    retrieveSalaryData(
        userId: AggregateId,
        role: string,
    ): Promise<SalaryHistoryEntity<SalaryHistoryProps>[]>;
}

export class MonitorSalaryApplicationService
    implements IMonitorSalaryApplicationService
{
    private readonly salaryFilterService: ISalaryFilterService;

    constructor(private readonly eventBus: EventBus) {
        this.salaryFilterService = new SalaryFilterService();
    }
    async retrieveSalaryData(
        userId: string,
        role: string,
    ): Promise<SalaryHistoryEntity<SalaryHistoryProps>[]> {
        let salaries = [] as SalaryHistoryEntity<SalaryHistoryProps>[]
        this.eventBus.removeSpecificListener("SalaryDataRetrieved");
        this.eventBus.publish(
            "SalaryDataRequested",
            new SalaryDataRequestedEvent(
                { id_user: userId, role: role },
                "SalaryDataRequested",
            ),
        );
        await new Promise<void>((resolve, reject) => {
            this.eventBus.subscribe(
                "SalaryDataRetrieved",
                async (salaryData: any) => {
                    try {
                        if (salaryData.data.status == "error") {
                            throw new ApplicationError(
                                salaryData.data.code,
                                salaryData.data.message,
                            );
                        }
                        // salaries = this.salaryFilterService.filterSalaryPaid(
                        //     salaryData.data,
                        // );
                        salaries = salaryData.data;
                        logger.debug(`salary data DISERVICE: ${JSON.stringify(salaryData.data)}`);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                },
            );
        });
        return salaries;
    }

    async retrieveSalaryDataById(
        role: string,
        user_id?: string,
    ): Promise<SalaryHistoryEntity<SalaryHistoryProps>[]> {
        let salaries = [] as SalaryHistoryEntity<SalaryHistoryProps>[]
        this.eventBus.removeSpecificListener("SalaryDataRetrieved");
        this.eventBus.publish(
            "SalaryDataRequestedById",
            new SalaryDataRequestedEvent(
                { role: role, user_id: user_id },
                "SalaryDataRequestedById",
            ),
        );
        await new Promise<void>((resolve, reject) => {
            this.eventBus.subscribe(
                "SalaryDataByIdRetrieved",
                async (salaryData: any) => {
                    try {
                        if (salaryData.data.status == "error") {
                            throw new ApplicationError(
                                salaryData.data.code,
                                salaryData.data.message,
                            );
                        }
                        // salaries = this.salaryFilterService.filterSalaryPaid(
                        //     salaryData.data,
                        // );
                        salaries = salaryData.data;
                        logger.debug(`salary data DISERVICE: ${JSON.stringify(salaryData.data)}`);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                },
            );
        });
        return salaries;
    }
}
