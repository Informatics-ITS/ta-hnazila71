import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../../shared/abstract";

const ErrorInvalidCashAmount = "Jumlah saldo harus bernilai lebih dari 0";

export class Cash {
    private readonly amount: number;

    constructor(amount: unknown) {
        if (amount === null || isNaN(Number(amount)) || amount === undefined || Number(amount) < 0) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidCashAmount,
            );
        }
        this.amount = Number(amount);
    }

    getAmount(): number {
        return this.amount;
    }
}
