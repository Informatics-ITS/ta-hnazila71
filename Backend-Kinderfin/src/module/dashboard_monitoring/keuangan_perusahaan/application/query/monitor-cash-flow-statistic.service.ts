import { ApplicationError } from "../../../../../shared/abstract";
import { EventBus } from "../../../../../shared/util";
import { CashFlowStatisticEntity } from "../../domain/entity";
import {
    MonthlyFundApplicationsRequestedEvent,
    MonthlyFundUsagesRequestedEvent,
} from "../../domain/event";
import { FinancialStatictic } from "../../domain/value_object";

export interface IMonitorCashFlowStatisticApplicationService {
    retrieveCashFlowStatistic(year: number): Promise<CashFlowStatisticEntity>;
}

export class MonitorCashFlowStatisticApplicationService
    implements IMonitorCashFlowStatisticApplicationService
{
    constructor(private readonly eventBus: EventBus) {}

    async retrieveCashFlowStatistic(
        year: number,
    ): Promise<CashFlowStatisticEntity> {
        const cashFlowStatistic = new CashFlowStatisticEntity(year);
        this.eventBus.removeSpecificListener(
            "MonthlyFundApplicationsRetrieved",
        );
        this.eventBus.publish(
            "MonthlyFundApplicationsRequested",
            new MonthlyFundApplicationsRequestedEvent(
                { tahun: cashFlowStatistic.getTahun() },
                "MonthlyFundApplicationsRequested",
            ),
        );
        await new Promise<void>((resolve, reject) => {
            this.eventBus.subscribe(
                "MonthlyFundApplicationsRetrieved",
                async (monthlyFundApplications: any) => {
                    try {
                        if (monthlyFundApplications.data.status == "error") {
                            throw new ApplicationError(
                                monthlyFundApplications.data.code,
                                monthlyFundApplications.data.message,
                            );
                        }
                        cashFlowStatistic.setRekapitulasiPengajuanDana(
                            monthlyFundApplications.data.map(
                                (monthlyFundApplicationData: any) => {
                                    return new FinancialStatictic(
                                        monthlyFundApplicationData.bulan,
                                        monthlyFundApplicationData.total,
                                    );
                                },
                            ),
                        );
                        this.eventBus.removeSpecificListener(
                            "MonthlyFundUsagesRetrieved",
                        );
                        this.eventBus.publish(
                            "MonthlyFundUsagesRequested",
                            new MonthlyFundUsagesRequestedEvent(
                                { tahun: year },
                                "MonthlyFundUsagesRequested",
                            ),
                        );
                        await new Promise<void>(async (resolve, reject) => {
                            this.eventBus.subscribe(
                                "MonthlyFundUsagesRetrieved",
                                async (monthlyFundUsages: any) => {
                                    try {
                                        if (
                                            monthlyFundUsages.data.status ==
                                            "error"
                                        ) {
                                            throw new ApplicationError(
                                                monthlyFundUsages.data.code,
                                                monthlyFundUsages.data.message,
                                            );
                                        }
                                        cashFlowStatistic.setRekapitulasiPenggunaanDana(
                                            monthlyFundUsages.data.map(
                                                (monthlyFundUsageData: any) => {
                                                    return new FinancialStatictic(
                                                        monthlyFundUsageData.bulan,
                                                        monthlyFundUsageData.total,
                                                    );
                                                },
                                            ),
                                        );
                                        resolve();
                                    } catch (error) {
                                        reject(error);
                                    }
                                },
                            );
                        });
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                },
            );
        });
        return cashFlowStatistic;
    }
}
