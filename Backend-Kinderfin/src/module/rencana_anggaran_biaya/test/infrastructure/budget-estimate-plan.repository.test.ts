import { StatusCodes } from "http-status-codes";
import { Sequelize, Transaction } from "sequelize";
import { ApplicationError } from "../../../../shared/abstract";
import {
    BudgetEstimatePlanEntity,
    BudgetEstimatePlanProps,
} from "../../domain/entity";
import { IBudgetEstimatePlanRepository } from "../../domain/repository";
import { BudgetEstimatePlanRepository } from "../../infrastructure/storage/repository";

describe("Testing Budget Estimate Plan Repository", () => {
    const budgetEstimatePlanRequestedData: BudgetEstimatePlanEntity<BudgetEstimatePlanProps>[] =
        [
            new BudgetEstimatePlanEntity<BudgetEstimatePlanProps>({
                id: "3679285c-707c-42ed-9c6e-9984825b22fd",
                tahun: 2023,
                aktivitas: "Honorarium",
                sub_aktivitas: "HR Test",
                jumlah: 2000000,
            }),
            new BudgetEstimatePlanEntity<BudgetEstimatePlanProps>({
                id: "d79fabb5-e776-4725-8ca5-a898e6c29511",
                tahun: 2023,
                aktivitas: "Layanan Kantor",
                sub_aktivitas: "Cetak KTM",
                jumlah: 350000,
            }),
            new BudgetEstimatePlanEntity<BudgetEstimatePlanProps>({
                id: "4fca6786-461f-40b8-8a32-6062ffbf6565",
                tahun: 2023,
                aktivitas: "Layanan Kantor",
                sub_aktivitas: "Pulsa",
                jumlah: 400000,
            }),
        ];

    const mockData = {
        transaction: jest
            .fn()
            .mockImplementation(
                async (callback: (t: Transaction) => Promise<void>) => {
                    await callback({} as Transaction);
                },
            ),
        transactionError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        bulkCreate: jest.fn(),
        bulkCreateError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        destroy: jest.fn(),
        destroyError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockedDatabase: Sequelize;
    let budgetEstimatePlanRepository: IBudgetEstimatePlanRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.transaction = mockData.transaction;
        mockedDatabase.models.rencana_anggaran_biaya = {
            bulkCreate: mockData.bulkCreate,
            destroy: mockData.destroy,
        } as any;
        budgetEstimatePlanRepository = new BudgetEstimatePlanRepository(
            mockedDatabase,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const transactionRun = {};
    describe("Refresh Budget Estimate Plan", () => {
        const budgetEstimatePlanYear = 2023;
        it("should success refresh budget estimate plan data", async () => {
            await budgetEstimatePlanRepository.refreshBudgetEstimatePlan(
                budgetEstimatePlanYear,
                budgetEstimatePlanRequestedData,
            );

            expect(mockedDatabase.transaction).toHaveBeenCalled();
            expect(
                mockedDatabase.models.rencana_anggaran_biaya.destroy,
            ).toHaveBeenCalledWith({
                where: { tahun: budgetEstimatePlanYear },
                transaction: transactionRun,
            });
            expect(
                mockedDatabase.models.rencana_anggaran_biaya.bulkCreate,
            ).toHaveBeenCalledWith(budgetEstimatePlanRequestedData, {
                transaction: transactionRun,
            });
        });

        it("should success refresh budget estimate plan data only clear data", async () => {
            await budgetEstimatePlanRepository.refreshBudgetEstimatePlan(
                budgetEstimatePlanYear,
            );

            expect(mockedDatabase.transaction).toHaveBeenCalled();
            expect(
                mockedDatabase.models.rencana_anggaran_biaya.destroy,
            ).toHaveBeenCalledWith({
                where: { tahun: budgetEstimatePlanYear },
                transaction: transactionRun,
            });
            expect(
                mockedDatabase.models.rencana_anggaran_biaya.bulkCreate,
            ).not.toHaveBeenCalled();
        });

        it("should error refresh budget estimate plan data on create new data", async () => {
            mockedDatabase.models.rencana_anggaran_biaya.bulkCreate =
                mockData.bulkCreateError;

            try {
                await budgetEstimatePlanRepository.refreshBudgetEstimatePlan(
                    budgetEstimatePlanYear,
                    budgetEstimatePlanRequestedData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.transaction).toHaveBeenCalled();
                expect(
                    mockedDatabase.models.rencana_anggaran_biaya.destroy,
                ).toHaveBeenCalledWith({
                    where: { tahun: budgetEstimatePlanYear },
                    transaction: transactionRun,
                });
                expect(
                    mockedDatabase.models.rencana_anggaran_biaya.bulkCreate,
                ).toHaveBeenCalledWith(budgetEstimatePlanRequestedData, {
                    transaction: transactionRun,
                });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error refresh budget estimate plan data on clear data", async () => {
            mockedDatabase.models.rencana_anggaran_biaya.destroy =
                mockData.destroyError;

            try {
                await budgetEstimatePlanRepository.refreshBudgetEstimatePlan(
                    budgetEstimatePlanYear,
                    budgetEstimatePlanRequestedData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.transaction).toHaveBeenCalled();
                expect(
                    mockedDatabase.models.rencana_anggaran_biaya.destroy,
                ).toHaveBeenCalledWith({
                    where: { tahun: budgetEstimatePlanYear },
                    transaction: transactionRun,
                });
                expect(
                    mockedDatabase.models.rencana_anggaran_biaya.bulkCreate,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error refresh budget estimate plan data on begin transaction", async () => {
            mockedDatabase.transaction = mockData.transactionError;

            try {
                await budgetEstimatePlanRepository.refreshBudgetEstimatePlan(
                    budgetEstimatePlanYear,
                    budgetEstimatePlanRequestedData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.transaction).toHaveBeenCalled();
                expect(
                    mockedDatabase.models.rencana_anggaran_biaya.destroy,
                ).not.toHaveBeenCalled();
                expect(
                    mockedDatabase.models.rencana_anggaran_biaya.bulkCreate,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
