import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import {
    BalanceSheetPostEntity,
    BalanceSheetPostProps,
} from "../../domain/entity";
import { IBalanceSheetPostRepository } from "../../domain/repository";
import { BalanceSheetPostRepository } from "../../infrastructure/storage/repository";

describe("Testing BalanceSheetPost Repository", () => {
    const mockBalanceSheetPostData: BalanceSheetPostProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        tahun_pos_neraca: 2022,
        saldo_tahun_lalu: 3000000,
        saldo_penerimaan_program_reguler: 7000000,
        saldo_kerja_sama: 2000000,
        kas: 12000000,
        piutang_usaha: 1000000,
        inventaris: 500000,
        penyusutan_inventaris: 50000,
        pendapatan_yang_belum_diterima: undefined,
        hutang_usaha: 500000,
        hutang_bank: 700000,
        laba_ditahan: 12250000,
    };

    const balanceSheetPostDataRequested =
        new BalanceSheetPostEntity<BalanceSheetPostProps>({
            id: "3679285c-707c-42ed-9c6e-9984825b22fd",
            tahun_pos_neraca: 2022,
            saldo_tahun_lalu: 3000000,
            saldo_penerimaan_program_reguler: 7000000,
            saldo_kerja_sama: 2000000,
            kas: 12000000,
            piutang_usaha: 1000000,
            inventaris: 500000,
            penyusutan_inventaris: 50000,
            hutang_usaha: 500000,
            hutang_bank: 700000,
        });
    balanceSheetPostDataRequested.calculateCash();
    balanceSheetPostDataRequested.validateStability();

    const mockData = {
        modified: jest.fn(),
        modifiedError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        find: jest.fn().mockReturnValue(mockBalanceSheetPostData),
        findNull: jest.fn().mockReturnValue(null),
        findError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockedDatabase: Sequelize;
    let balanceSheetPostRepository: IBalanceSheetPostRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.models.pos_neraca = {
            create: mockData.modified,
            update: mockData.modified,
            findByPk: mockData.find,
            findOne: mockData.find,
        } as any;
        balanceSheetPostRepository = new BalanceSheetPostRepository(
            mockedDatabase,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const balanceSheetPostDataId = "3679285c-707c-42ed-9c6e-9984825b22fd";
    describe("Add Balance Sheet Post", () => {
        it("should success add an balance sheet post data", async () => {
            await balanceSheetPostRepository.addBalanceSheetPost(
                balanceSheetPostDataRequested,
            );

            expect(
                mockedDatabase.models.pos_neraca.create,
            ).toHaveBeenCalledWith({
                ...balanceSheetPostDataRequested,
                kas: balanceSheetPostDataRequested.getKas()!.getAmount(),
            });
        });

        it("should error add an balance sheet post data", async () => {
            mockedDatabase.models.pos_neraca.create = mockData.modifiedError;

            try {
                await balanceSheetPostRepository.addBalanceSheetPost(
                    balanceSheetPostDataRequested,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.pos_neraca.create,
                ).toHaveBeenCalledWith({
                    ...balanceSheetPostDataRequested,
                    kas: balanceSheetPostDataRequested.getKas()!.getAmount(),
                });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Update Balance Sheet Post", () => {
        it("should success update balance sheet post data", async () => {
            await balanceSheetPostRepository.updateBalanceSheetPost(
                balanceSheetPostDataRequested,
            );

            expect(
                mockedDatabase.models.pos_neraca.update,
            ).toHaveBeenCalledWith(
                {
                    ...balanceSheetPostDataRequested,
                    kas: balanceSheetPostDataRequested.getKas()!.getAmount(),
                },
                {
                    where: { id: balanceSheetPostDataId },
                },
            );
        });

        it("should error update balance sheet post data", async () => {
            mockedDatabase.models.pos_neraca.update = mockData.modifiedError;

            try {
                await balanceSheetPostRepository.updateBalanceSheetPost(
                    balanceSheetPostDataRequested,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.pos_neraca.update,
                ).toHaveBeenCalledWith(
                    {
                        ...balanceSheetPostDataRequested,
                        kas: balanceSheetPostDataRequested.getKas()!.getAmount(),
                    },
                    {
                        where: { id: balanceSheetPostDataId },
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Check Balance Sheet Post Data By Id", () => {
        it("should success return an balance sheet post data by id", async () => {
            const balanceSheetPost =
                await balanceSheetPostRepository.isBalanceSheetPostDataIdExist(
                    balanceSheetPostDataId,
                );

            expect(
                mockedDatabase.models.pos_neraca.findByPk,
            ).toHaveBeenCalledWith(balanceSheetPostDataId);
            expect(balanceSheetPost).toEqual(mockBalanceSheetPostData);
        });

        it("should success return an empty balance sheet post data by id", async () => {
            mockedDatabase.models.pos_neraca.findByPk = mockData.findNull;

            const balanceSheetPost =
                await balanceSheetPostRepository.isBalanceSheetPostDataIdExist(
                    balanceSheetPostDataId,
                );

            expect(
                mockedDatabase.models.pos_neraca.findByPk,
            ).toHaveBeenCalledWith(balanceSheetPostDataId);
            expect(balanceSheetPost).toBeNull();
        });

        it("should error return an balance sheet post data by id", async () => {
            mockedDatabase.models.pos_neraca.findByPk = mockData.findError;

            try {
                await balanceSheetPostRepository.isBalanceSheetPostDataIdExist(
                    balanceSheetPostDataId,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.pos_neraca.findByPk,
                ).toHaveBeenCalledWith(balanceSheetPostDataId);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Check Balance Sheet Post Data By Year", () => {
        const balanceSheetPostYear = 2022;
        it("should success return true value", async () => {
            const value =
                await balanceSheetPostRepository.isBalanceSheetPostDataYearExist(
                    balanceSheetPostYear,
                );

            expect(
                mockedDatabase.models.pos_neraca.findOne,
            ).toHaveBeenCalledWith({
                where: { tahun_pos_neraca: balanceSheetPostYear },
            });
            expect(value).toBeTruthy();
        });

        it("should success return false value", async () => {
            mockedDatabase.models.pos_neraca.findOne = mockData.findNull;

            const value =
                await balanceSheetPostRepository.isBalanceSheetPostDataYearExist(
                    balanceSheetPostYear,
                );

            expect(
                mockedDatabase.models.pos_neraca.findOne,
            ).toHaveBeenCalledWith({
                where: { tahun_pos_neraca: balanceSheetPostYear },
            });
            expect(value).toBeFalsy();
        });

        it("should error return an balance sheet post data by year", async () => {
            mockedDatabase.models.pos_neraca.findOne = mockData.findError;

            try {
                await balanceSheetPostRepository.isBalanceSheetPostDataYearExist(
                    balanceSheetPostYear,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.pos_neraca.findOne,
                ).toHaveBeenCalledWith({
                    where: { tahun_pos_neraca: balanceSheetPostYear },
                });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
