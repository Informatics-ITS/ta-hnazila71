import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import {
    IFundApplicationQueryHandler,
} from "../../application/query";
import { FundApplicationProps } from "../../domain/entity";
import { MonthlyFundApplicationValue } from "../../domain/event";
import { FundApplicationQueryHandler } from "../../infrastructure/storage/query";

describe("Testing Fund Application Query", () => {
    const mockFundApplicationData: FundApplicationProps[] = [
        {
            id: "78bae457-6f69-44b6-83b0-fd6a38d69378",
            deskripsi: "Telepon PIKTI",
            unit: "Bulan",
            quantity_1: 1,
            quantity_2: 1,
            harga_satuan: 1600000,
            jumlah: 1600000,
        },
        {
            id: "de481f0d-2dd7-48cf-a13d-c6b56fd56e2b",
            deskripsi: "Honorarium Teknisi PIKTI",
            unit: "OB",
            quantity_1: 25,
            quantity_2: 5,
            harga_satuan: 120000,
            jumlah: 15000000,
        },
    ];

    const mockMonthlyFundApplicationsData = [
        {
            month: 6,
            total: 10000000,
        },
        {
            month: 7,
            total: 8000000,
        },
        {
            month: 10,
            total: 16600000,
        },
        {
            month: 12,
            total: 15000000,
        },
    ];

    const resultMonthlyFundApplicationsData: MonthlyFundApplicationValue[] = [
        {
            bulan: 6,
            total: 10000000,
        },
        {
            bulan: 7,
            total: 8000000,
        },
        {
            bulan: 10,
            total: 16600000,
        },
        {
            bulan: 12,
            total: 15000000,
        },
    ];

    const mockData = {
        findAll: jest.fn().mockReturnValue(mockFundApplicationData),
        findAllError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        findAllMonthly: jest
            .fn()
            .mockReturnValue(mockMonthlyFundApplicationsData),
        findAllMonthlyError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockedDatabase: Sequelize;
    let fundApplicationQueryHandler: IFundApplicationQueryHandler;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.models.pengajuan_dana = {
            findAll: mockData.findAll,
        } as any;
        fundApplicationQueryHandler = new FundApplicationQueryHandler(
            mockedDatabase,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    let [fundApplicationMonth, fundApplicationYear] = [10, 2023];
    describe("Get All Fund Applications", () => {
        it("should success return all fund application datas", async () => {
            const fundApplications =
                await fundApplicationQueryHandler.getAllFundApplications(
                    fundApplicationMonth,
                    fundApplicationYear,
                );

            expect(
                mockedDatabase.models.pengajuan_dana.findAll,
            ).toHaveBeenCalledWith({
                where: {
                    bulan: fundApplicationMonth,
                    tahun: fundApplicationYear,
                },
            });
            expect(fundApplications.pengajuan_dana).toEqual(
                mockFundApplicationData,
            );
            expect(fundApplications.jumlah).toEqual(16600000);
        });

        it("should error return all fund application datas", async () => {
            mockedDatabase.models.pengajuan_dana.findAll =
                mockData.findAllError;

            try {
                await fundApplicationQueryHandler.getAllFundApplications(
                    fundApplicationMonth,
                    fundApplicationYear,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.pengajuan_dana.findAll,
                ).toHaveBeenCalledWith({
                    where: {
                        bulan: fundApplicationMonth,
                        tahun: fundApplicationYear,
                    },
                });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Get Monthly Fund Application Data By Year", () => {
        it("should success return a fund application data by year", async () => {
            mockedDatabase.models.pengajuan_dana.findAll =
                mockData.findAllMonthly;

            const monthlyFundApplications =
                await fundApplicationQueryHandler.getMonthlyFundApplicationsByYear(
                    fundApplicationYear,
                );

            expect(
                mockedDatabase.models.pengajuan_dana.findAll,
            ).toHaveBeenCalled();
            expect(monthlyFundApplications).toEqual(
                resultMonthlyFundApplicationsData,
            );
        });

        it("should error return a fund application data by year", async () => {
            mockedDatabase.models.pengajuan_dana.findAll =
                mockData.findAllMonthlyError;

            try {
                await fundApplicationQueryHandler.getMonthlyFundApplicationsByYear(
                    fundApplicationYear,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.pengajuan_dana.findAll,
                ).toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
