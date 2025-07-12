import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import { IBalanceSheetPostQueryHandler } from "../../application/query";
import { BalanceSheetPostProps } from "../../domain/entity";
import { BalanceSheetPostQueryHandler } from "../../infrastructure/storage/query";

describe("Testing Balance Sheet Post Query", () => {
    const mockBalanceSheetPostData: BalanceSheetPostProps[] = [
        {
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
        },
        {
            id: "69baf182-5e75-4c92-bfe0-dd98571a904e",
            tahun_pos_neraca: 2023,
            saldo_tahun_lalu: 4000000,
            saldo_penerimaan_program_reguler: 6000000,
            saldo_kerja_sama: 2000000,
            kas: 12000000,
            piutang_usaha: 2000000,
            inventaris: 500000,
            penyusutan_inventaris: 50000,
            pendapatan_yang_belum_diterima: undefined,
            hutang_usaha: 3000000,
            hutang_bank: 2000000,
            laba_ditahan: 9450000,
        },
    ];

    const mockData = {
        findAll: jest.fn().mockReturnValue(mockBalanceSheetPostData),
        findOne: jest.fn().mockReturnValue(mockBalanceSheetPostData[1]),
        findOneNull: jest.fn().mockReturnValue(null),
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
    let balanceSheetPostQueryHandler: IBalanceSheetPostQueryHandler;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.models.pos_neraca = {
            findAll: mockData.findAll,
            findOne: mockData.findOne,
        } as any;
        balanceSheetPostQueryHandler = new BalanceSheetPostQueryHandler(
            mockedDatabase,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Get All Balance Sheet Posts", () => {
        it("should success return all balance sheet post datas", async () => {
            const balanceSheetPosts =
                await balanceSheetPostQueryHandler.getAllBalanceSheetPosts();

            expect(mockedDatabase.models.pos_neraca.findAll).toHaveBeenCalled();
            expect(balanceSheetPosts).toEqual(mockBalanceSheetPostData);
        });

        it("should error return all balance sheet post datas", async () => {
            mockedDatabase.models.pos_neraca.findAll = mockData.findError;

            try {
                await balanceSheetPostQueryHandler.getAllBalanceSheetPosts();
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.pos_neraca.findAll,
                ).toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Get Balance Sheet Post Data By Year", () => {
        const balanceSheetPostYear = 2023;
        it("should success return an balance sheet post data by year", async () => {
            const balanceSheetPost =
                await balanceSheetPostQueryHandler.getBalanceSheetPostDataByBalanceSheetPostYear(
                    balanceSheetPostYear,
                );

            expect(
                mockedDatabase.models.pos_neraca.findOne,
            ).toHaveBeenCalledWith({
                where: { tahun_pos_neraca: balanceSheetPostYear },
            });
            expect(balanceSheetPost).toEqual(mockBalanceSheetPostData[1]);
        });

        it("should success return an empty balance sheet post data by year", async () => {
            mockedDatabase.models.pos_neraca.findOne = mockData.findOneNull;

            const balanceSheetPost =
                await balanceSheetPostQueryHandler.getBalanceSheetPostDataByBalanceSheetPostYear(
                    balanceSheetPostYear,
                );

            expect(
                mockedDatabase.models.pos_neraca.findOne,
            ).toHaveBeenCalledWith({
                where: { tahun_pos_neraca: balanceSheetPostYear },
            });
            expect(balanceSheetPost).toEqual({});
        });

        it("should error return an balance sheet post data by year", async () => {
            mockedDatabase.models.pos_neraca.findOne = mockData.findError;

            try {
                await balanceSheetPostQueryHandler.getBalanceSheetPostDataByBalanceSheetPostYear(
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
