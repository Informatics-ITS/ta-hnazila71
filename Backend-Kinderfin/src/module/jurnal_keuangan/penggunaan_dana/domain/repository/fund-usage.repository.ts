import { AggregateId } from "../../../../../shared/abstract";
import { FundUsageEntity, FundUsageProps } from "../entity";

export interface IFundUsageRepository {
    addFundUsage(fundUsageData: FundUsageEntity<FundUsageProps>): Promise<void>;
    updateFundUsage(
        fundUsageData: FundUsageEntity<FundUsageProps>,
    ): Promise<void>;
    deleteFundUsage(fundUsageId: AggregateId): Promise<void>;
    isFundUsageIdExist(
        fundUsageId: AggregateId,
    ): Promise<FundUsageProps | null>;
    isFundUsageSameHRExist(
        subActivity: string,
        usageMonth: number,
        usageYear: number,
        receiver: string,
    ): Promise<boolean>;
}
