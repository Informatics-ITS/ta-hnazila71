import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../shared/abstract";
import { BankAccount } from "../../domain/value_object";

describe("Testing Bank Account Value Object", () => {
    let [nama_bank, pemilik_rekening, nomor_rekening, aturan] = [
        "Bank A",
        "User A",
        "135349212211",
        "12 digit",
    ];

    describe("Constructor New Bank Account Value Object", () => {
        it("should success match new bank account value object", async () => {
            const bankAccount = new BankAccount(
                nama_bank,
                pemilik_rekening,
                nomor_rekening,
            );

            expect(bankAccount.getNamaBank()).toEqual(nama_bank);
            expect(bankAccount.getPemilikRekening()).toEqual(pemilik_rekening);
            expect(bankAccount.getNomorRekening()).toEqual(nomor_rekening);
        });

        it("should error match new bank account value object on account number", async () => {
            nomor_rekening = "13534921221f";

            try {
                new BankAccount(nama_bank, pemilik_rekening, nomor_rekening);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input nomor rekening hanya dapat berisi angka",
                );
            }
        });

        it("should error match new bank account value object on owner", async () => {
            pemilik_rekening = "User 1";

            try {
                new BankAccount(nama_bank, pemilik_rekening, nomor_rekening);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input pemilik rekening hanya dapat berisi huruf atau spasi",
                );
            }
        });

        it("should error match new bank account value object on bank name", async () => {
            nama_bank = "Bank 1";

            try {
                new BankAccount(nama_bank, pemilik_rekening, nomor_rekening);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input nama bank hanya dapat berisi huruf atau spasi",
                );
            }
        });
    });

    describe("Validate Bank Account Number Digit", () => {
        it("should success match bank account number digit", async () => {
            [nama_bank, pemilik_rekening, nomor_rekening] = [
                "Bank A",
                "User A",
                "135349212211",
            ];
            const bankAccount = new BankAccount(
                nama_bank,
                pemilik_rekening,
                nomor_rekening,
            );
            const result = bankAccount.validateAccountNumberDigit(aturan);

            expect(result).toBeNull();
        });

        it("should error match bank account number digit", async () => {
            aturan = "11 digit";

            const bankAccount = new BankAccount(
                nama_bank,
                pemilik_rekening,
                nomor_rekening,
            );
            const result = bankAccount.validateAccountNumberDigit(aturan);

            expect(result?.message).toEqual(
                "Input nomor rekening harus terdiri dari 11 digit",
            );
        });

        it("should error match bank account number digit with null value", async () => {
            aturan = "";

            const bankAccount = new BankAccount(
                nama_bank,
                pemilik_rekening,
                nomor_rekening,
            );
            const result = bankAccount.validateAccountNumberDigit(aturan);

            expect(result?.message).toEqual(
                "Input nomor rekening harus terdiri dari 0 digit",
            );
        });
    });
});
