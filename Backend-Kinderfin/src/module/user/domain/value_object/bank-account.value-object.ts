import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../shared/abstract";
import { logger } from "../../../../shared/util";

const ErrorInvalidBankNamePattern =
    "Input nama bank hanya dapat berisi huruf atau spasi";
const ErrorInvalidOwnerPattern =
    "Input pemilik rekening hanya dapat berisi huruf atau spasi";
const ErrorInvalidAccountNumberPattern =
    "Input nomor rekening hanya dapat berisi angka";

export class BankAccount {
    private readonly nama_bank: string;
    private readonly pemilik_rekening: string;
    private readonly nomor_rekening: string;

    constructor(bankName: string, owner: string, accountNumber: string) {
        if (!/^[a-zA-Z ]*$/.test(bankName)) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidBankNamePattern,
            );
        }
        if (!/^[a-zA-Z ]*$/.test(owner)) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidOwnerPattern,
            );
        }
        if (!/^\d*$/.test(accountNumber)) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidAccountNumberPattern,
            );
        }
        this.nama_bank = bankName;
        this.pemilik_rekening = owner;
        this.nomor_rekening = accountNumber;
    }

    getNamaBank(): string {
        return this.nama_bank;
    }

    getPemilikRekening(): string {
        return this.pemilik_rekening;
    }

    getNomorRekening(): string {
        return this.nomor_rekening;
    }

    validateAccountNumberDigit(bankConstraint: string): Error | null {
        const limitLength =
            bankConstraint == "" ? 0 : parseInt(bankConstraint.split(" ")[0]);
        logger.info("limitLength: " + limitLength);
        logger.info("nomor_rekening: " + this.nomor_rekening);
        return this.nomor_rekening.length == limitLength
            ? null
            : Error(
                  `Input nomor rekening harus terdiri dari ${limitLength} digit`,
              );
    }
}
