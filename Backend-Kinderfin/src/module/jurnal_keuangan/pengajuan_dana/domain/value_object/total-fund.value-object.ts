import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../../shared/abstract";

const ErrorInvalidTotalFundAmount =
    "Jumlah pengajuan dana harus bernilai lebih dari 0";

export class TotalFund {
    private readonly amount: number;

    constructor(amount: unknown) {
        if (amount === null || isNaN(Number(amount)) || amount === undefined) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidTotalFundAmount,
            );
        }
        this.amount = Number(amount);
    }

    getAmount(): number {
        return this.amount;
    }
}
