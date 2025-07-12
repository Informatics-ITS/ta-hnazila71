import { ApplicationError } from "../../../../../shared/abstract";
import { EventBus } from "../../../../../shared/util";
import { BalanceSheetEntity, BalanceSheetProps } from "../../domain/entity";
import { BalanceSheetPostDataRequestedEvent } from "../../domain/event";

export interface IMonitorBalanceSheetApplicationService {
    retrieveBalanceSheetData(year: number): Promise<BalanceSheetEntity>;
}

export class MonitorBalanceSheetApplicationService
    implements IMonitorBalanceSheetApplicationService
{
    constructor(private readonly eventBus: EventBus) {}

    async retrieveBalanceSheetData(year: number): Promise<BalanceSheetEntity> {
        const balanceSheet = new BalanceSheetEntity(year);
        this.eventBus.removeSpecificListener("BalanceSheetPostDataRetrieved");
        this.eventBus.publish(
            "BalanceSheetPostDataRequested",
            new BalanceSheetPostDataRequestedEvent(
                { tahun: balanceSheet.getTahun() },
                "BalanceSheetPostDataRequested",
            ),
        );
        await new Promise<void>((resolve, reject) => {
            this.eventBus.subscribe(
                "BalanceSheetPostDataRetrieved",
                async (balanceSheetPostData: any) => {
                    try {
                        if (balanceSheetPostData.data.status == "error") {
                            throw new ApplicationError(
                                balanceSheetPostData.data.code,
                                balanceSheetPostData.data.message,
                            );
                        }
                        balanceSheet.calculateBalanceSheetData(
                            balanceSheetPostData.data as BalanceSheetProps,
                        );
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                },
            );
        });
        return balanceSheet;
    }
}
