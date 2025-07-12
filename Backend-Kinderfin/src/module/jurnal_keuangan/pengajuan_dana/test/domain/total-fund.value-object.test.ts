import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../../shared/abstract";
import { TotalFund } from "../../domain/value_object";

describe("Testing Total Fund Value Object", () => {
    const amount = 1600000;

    describe("Constructor New Total Fund Value Object", () => {
        it("should success match new total fund value object", async () => {
            const newTotalFund = new TotalFund(amount);

            expect(newTotalFund.getAmount()).toEqual(amount);
        });

        it("should error match wrong number type on new total fund value object", async () => {
            const amount = "1600000";

            try {
                new TotalFund(amount);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Jumlah pengajuan dana harus bernilai lebih dari 0",
                );
            }
        });
    });
});
