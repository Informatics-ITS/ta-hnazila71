import { ApplicationError } from "../../../../../shared/abstract";
import { IFundUsageRepository } from "../repository";

const months = [
    ["Januari", "January"],
    ["Februari", "February"],
    ["Maret", "March"],
    ["April", "April"],
    ["Mei", "May"],
    ["Juni", "June"],
    ["Juli", "July"],
    ["Agustus", "August"],
    ["September", "September"],
    ["Oktober", "October"],
    ["November", "November"],
    ["Desember", "December"],
];

export interface IFundUsageService {
    validateUniqueFundUsageHR(
        subActivity: string,
        usageMonth: number,
        usageYear: number,
        receiver: string,
        fundUsageRepository: IFundUsageRepository,
    ): Promise<Error | null>;
}

export class FundUsageService implements IFundUsageService {
    async validateUniqueFundUsageHR(
        subActivity: string,
        usageMonth: number,
        usageYear: number,
        receiver: string,
        fundUsageRepository: IFundUsageRepository,
    ): Promise<Error | null> {
        try {
            return (await fundUsageRepository.isFundUsageSameHRExist(
                subActivity,
                usageMonth,
                usageYear,
                receiver,
            ))
                ? Error(
                      `Data penggunaan dana untuk sub aktivitas ${subActivity} kepada ${receiver} pada ${
                          months[usageMonth - 1][0]
                      } ${usageYear} telah dilaporkan`,
                  )
                : null;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
