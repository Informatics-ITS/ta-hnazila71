import { ApplicationError } from "../../../../../shared/abstract";
import { IBalanceSheetPostRepository } from "../repository";

export interface IBalanceSheetPostService {
    validateUniqueBalanceSheetYear(
        year: number,
        balanceSheetPostRepository: IBalanceSheetPostRepository,
    ): Promise<Error | null>;
}

export class BalanceSheetPostService implements IBalanceSheetPostService {
    async validateUniqueBalanceSheetYear(
        year: number,
        balanceSheetPostRepository: IBalanceSheetPostRepository,
    ): Promise<Error | null> {
        try {
            return (await balanceSheetPostRepository.isBalanceSheetPostDataYearExist(
                year,
            ))
                ? Error(`Data pos neraca ${year} telah dimasukkan`)
                : null;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
