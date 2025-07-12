import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../../shared/abstract";
import { CashFlowStatisticEntity } from "../../domain/entity";
import { FinancialStatictic } from "../../domain/value_object";

describe("Testing Cash Flow Statistic Entity", () => {
    let year = 2023;
    const monthlyFundApplicationData = [
        new FinancialStatictic(
            8,
            12000000,
        ),
        new FinancialStatictic(
            10,
            10000000,
        ),
        new FinancialStatictic(
            11,
            11000000,
        ),
    ]
    const monthlyFundUsageData = [
        new FinancialStatictic(
            8,
            10000000,
        ),
        new FinancialStatictic(
            10,
            5000000,
        ),
        new FinancialStatictic(
            11,
            14000000,
        ),
    ]

    describe("Constructor New Cash Flow Statistic Entity", () => {
        it("should success match new cash flow statistic entity", async () => {
            const newCashFlowStatistic = new CashFlowStatisticEntity(year);
            newCashFlowStatistic.setRekapitulasiPengajuanDana(monthlyFundApplicationData)
            newCashFlowStatistic.setRekapitulasiPenggunaanDana(monthlyFundUsageData)

            expect(newCashFlowStatistic.getTahun()).toEqual(year);
            expect(newCashFlowStatistic.getRekapitulasiPengajuanDana()).toEqual(monthlyFundApplicationData);
            expect(newCashFlowStatistic.getRekapitulasiPenggunaanDana()).toEqual(monthlyFundUsageData);
        });

        it("should error match wrong year on new cash flow statistic entity", async () => {
            year = 1999;

            try {
                new CashFlowStatisticEntity(year);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Tahun statistik arus keuangan tidak valid",
                );
            }
        });
    });
});
