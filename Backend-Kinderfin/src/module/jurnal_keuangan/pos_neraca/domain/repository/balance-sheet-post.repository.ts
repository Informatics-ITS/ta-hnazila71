import { AggregateId } from "../../../../../shared/abstract";
import { BalanceSheetPostEntity, BalanceSheetPostProps } from "../entity";

export interface IBalanceSheetPostRepository {
    addBalanceSheetPost(
        balanceSheetPostData: BalanceSheetPostEntity<BalanceSheetPostProps>,
    ): Promise<void>;
    updateBalanceSheetPost(
        balanceSheetPostData: BalanceSheetPostEntity<BalanceSheetPostProps>,
    ): Promise<void>;
    isBalanceSheetPostDataIdExist(
        balanceSheetPostId: AggregateId,
    ): Promise<BalanceSheetPostProps | null>;
    isBalanceSheetPostDataYearExist(
        balanceSheetPostYear: number,
    ): Promise<boolean>;
}
