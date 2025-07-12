import { AggregateId } from "../../../../../shared/abstract";
import { FundApplicationEntity, FundApplicationProps } from "../entity";

export interface IFundApplicationRepository {
    addFundApplication(
        fundApplicationData: FundApplicationEntity<FundApplicationProps>,
    ): Promise<void>;
    updateFundApplication(
        fundApplicationData: FundApplicationEntity<FundApplicationProps>,
    ): Promise<void>;
    deleteFundApplication(fundApplicationId: AggregateId): Promise<void>;
    isFundApplicationIdExist(
        fundApplicationId: AggregateId,
    ): Promise<FundApplicationProps | null>;
}
