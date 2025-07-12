import { BalanceSheetPostProps } from "../../domain/entity";

export interface IBalanceSheetPostQueryHandler {
    getAllBalanceSheetPosts(): Promise<BalanceSheetPostProps[]>;
    getBalanceSheetPostDataByBalanceSheetPostYear(
        balanceSheetPostYear: number,
    ): Promise<BalanceSheetPostProps>;
}
