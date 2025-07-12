import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../shared/abstract";
import {
    BudgetEstimatePlanEntity,
    BudgetEstimatePlanProps,
} from "../../domain/entity";

describe("Testing Budget Estimate Plan Entity", () => {
    const mockBudgetEstimatePlan: BudgetEstimatePlanProps = {
        id: "d79fabb5-e776-4725-8ca5-a898e6c29511",
        tahun: 2023,
        aktivitas: "Honorarium",
        sub_aktivitas: "HR Test",
        jumlah: 2000000,
    };

    describe("Constructor New Budget Estimate Plan Entity", () => {
        it("should success match new budget estimate plan entity", async () => {
            const newBudgetEstimatePlan =
                new BudgetEstimatePlanEntity<BudgetEstimatePlanProps>(
                    mockBudgetEstimatePlan,
                );

            expect(newBudgetEstimatePlan.id).toEqual(mockBudgetEstimatePlan.id);
            expect(newBudgetEstimatePlan.getTahun()).toEqual(
                mockBudgetEstimatePlan.tahun,
            );
            expect(newBudgetEstimatePlan.getAktivitas()).toEqual(
                mockBudgetEstimatePlan.aktivitas,
            );
            expect(newBudgetEstimatePlan.getSubAktivitas()).toEqual(
                mockBudgetEstimatePlan.sub_aktivitas,
            );
            expect(newBudgetEstimatePlan.getJumlah()).toEqual(
                mockBudgetEstimatePlan.jumlah,
            );
        });

        it("should error match wrong year on new budget estimate plan entity", async () => {
            mockBudgetEstimatePlan.tahun = 1999;
            try {
                new BudgetEstimatePlanEntity<BudgetEstimatePlanProps>(
                    mockBudgetEstimatePlan,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Tahun rencana anggaran biaya tidak valid",
                );
            }
        });
    });
});
