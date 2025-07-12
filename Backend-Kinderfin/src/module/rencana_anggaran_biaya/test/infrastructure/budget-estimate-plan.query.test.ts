import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../shared/abstract";
import {
    BudgetEstimatePlanResult,
    IBudgetEstimatePlanQueryHandler,
} from "../../application/query";
import { BudgetEstimatePlanQueryHandler } from "../../infrastructure/storage/query";

describe("Testing Budget Estimate Plan Query", () => {
    const mockBudgetEstimatePlanData: BudgetEstimatePlanResult[] = [
        {
            aktivitas: "Honorarium",
            sub_aktivitas: ["HR Test"],
            jumlah: [3400000],
            total: 3400000,
        },
        {
            aktivitas: "Layanan Kantor",
            sub_aktivitas: ["Cetak KTM", "Pulsa"],
            jumlah: [350000, 400000],
            total: 750000,
        },
    ];

    const mockData = {
        findAll: jest.fn().mockReturnValue(mockBudgetEstimatePlanData),
        findAllError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockedDatabase: Sequelize;
    let budgetEstimatePlanQueryHandler: IBudgetEstimatePlanQueryHandler;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.models.rencana_anggaran_biaya = {
            findAll: mockData.findAll,
        } as any;
        budgetEstimatePlanQueryHandler = new BudgetEstimatePlanQueryHandler(
            mockedDatabase,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Get All Budget Estimate Plans", () => {
        const budgetEstimatePlanYear = 2024;
        it("should success return all budget estimate plan datas", async () => {
            const budgetEstimatePlans =
                await budgetEstimatePlanQueryHandler.getAllBudgetEstimatePlans(
                    budgetEstimatePlanYear,
                );

            expect(
                mockedDatabase.models.rencana_anggaran_biaya.findAll,
            ).toHaveBeenCalled();
            expect(budgetEstimatePlans.rencana_anggaran_biaya).toEqual(
                mockBudgetEstimatePlanData,
            );
            expect(budgetEstimatePlans.total).toEqual(4150000);
        });

        it("should error return all budget estimate plan datas", async () => {
            mockedDatabase.models.rencana_anggaran_biaya.findAll =
                mockData.findAllError;

            try {
                await budgetEstimatePlanQueryHandler.getAllBudgetEstimatePlans(
                    budgetEstimatePlanYear,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.rencana_anggaran_biaya.findAll,
                ).toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
