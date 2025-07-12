import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../../shared/abstract";
import { Cash } from "../../domain/value_object";

describe("Testing Cash Value Object", () => {
    const amount = 1600000;

    describe("Constructor New Cash Value Object", () => {
        it("should success match new cash value object", async () => {
            const newCash = new Cash(amount);

            expect(newCash.getAmount()).toEqual(amount);
        });

        it("should error match wrong number type on new cash value object", async () => {
            const amount = "1600000";

            try {
                new Cash(amount);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Jumlah saldo harus bernilai lebih dari 0",
                );
            }
        });
    });
});
