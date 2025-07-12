import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import {
    IFundUsageQueryHandler,
} from "../../application/query";
import { MonthlyFundUsageValue, SimplifiedFundUsagesResult } from "../../domain/event";
import { FundUsageQueryHandler } from "../../infrastructure/storage/query";

describe("Testing Fund Usage Query", () => {
    const mockFundUsageData = [
        {
            id: "1b0cce47-e920-4876-b32c-0547b09f6db1",
            aktivitas: "Honorarium",
            tanggal: new Date("2023-10-12"),
            penerima: "Test User",
            sub_aktivitas: "HR Test",
            uraian: "Honorarium Test PIKTI Oktober 2023",
            jumlah: 1500000,
        },
        {
            id: "0b79f9a5-1b2a-49fb-8ec4-ba177b2d4923",
            aktivitas: "Layanan Kantor",
            tanggal: new Date("2023-10-12"),
            penerima: "Alpha",
            sub_aktivitas: "Cetak KTM",
            uraian: "Cetak KTM atas nama Alpha",
            jumlah: 350000,
        },
    ];

    const mockMonthlyFundUsagesData = [
        {
            month: 7,
            total: 5000000,
        },
        {
            month: 10,
            total: 1850000,
        },
    ];

    const resultMonthlyFundUsagesData: MonthlyFundUsageValue[] = [
        {
            bulan: 7,
            total: 5000000,
        },
        {
            bulan: 10,
            total: 1850000,
        },
    ];

    const mockSimplifiedFundUsagesData = [
        {
            aktivitas: "Honorarium",
            sub_aktivitas: "HR Test",
            total: "3500000",
        },
        {
            aktivitas: "Layanan Kantor",
            sub_aktivitas: "Pulsa",
            total: "400000",
        },
        {
            aktivitas: "Layanan Kantor",
            sub_aktivitas: "Cetak KTM",
            total: "350000",
        },
    ];

    const mockData = {
        findAll: jest.fn().mockReturnValue(mockFundUsageData),
        findAllError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        findAllMonthly: jest.fn().mockReturnValue(mockMonthlyFundUsagesData),
        findAllMonthlyError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        findAllSimplified: jest
            .fn()
            .mockReturnValue(mockSimplifiedFundUsagesData),
        findAllSimplifiedError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockedDatabase: Sequelize;
    let fundUsageQueryHandler: IFundUsageQueryHandler;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.models.penggunaan_dana = {
            findAll: mockData.findAll,
        } as any;
        fundUsageQueryHandler = new FundUsageQueryHandler(mockedDatabase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    let [fundUsageMonth, fundUsageYear] = [10, 2023];
    describe("Get All Fund Usages", () => {
        it("should success return all fund usage datas", async () => {
            const fundUsages = await fundUsageQueryHandler.getAllFundUsages(
                fundUsageMonth,
                fundUsageYear,
            );

            expect(
                mockedDatabase.models.penggunaan_dana.findAll,
            ).toHaveBeenCalled();
            expect(fundUsages.penggunaan_dana).toEqual(mockFundUsageData);
            expect(fundUsages.jumlah).toEqual(1850000);
        });

        it("should error return all fund usage datas", async () => {
            mockedDatabase.models.penggunaan_dana.findAll =
                mockData.findAllError;

            try {
                await fundUsageQueryHandler.getAllFundUsages(
                    fundUsageMonth,
                    fundUsageYear,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.penggunaan_dana.findAll,
                ).toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Get Monthly Fund Usage Data By Year", () => {
        it("should success return an fund usage data by year", async () => {
            mockedDatabase.models.penggunaan_dana.findAll =
                mockData.findAllMonthly;

            const monthlyFundUsages =
                await fundUsageQueryHandler.getMonthlyFundUsagesByYear(
                    fundUsageYear,
                );

            expect(
                mockedDatabase.models.penggunaan_dana.findAll,
            ).toHaveBeenCalled();
            expect(monthlyFundUsages).toEqual(resultMonthlyFundUsagesData);
        });

        it("should error return an fund usage data by year", async () => {
            mockedDatabase.models.penggunaan_dana.findAll =
                mockData.findAllMonthlyError;

            try {
                await fundUsageQueryHandler.getMonthlyFundUsagesByYear(
                    fundUsageYear,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.penggunaan_dana.findAll,
                ).toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Get Simplified Fund Usages By Year", () => {
        const simplifiedFundUsagesResult: SimplifiedFundUsagesResult[] = [
            {
                aktivitas: "Honorarium",
                sub_aktivitas: "HR Test",
                tahun: 2023,
                jumlah: 3500000,
            },
            {
                aktivitas: "Layanan Kantor",
                sub_aktivitas: "Pulsa",
                tahun: 2023,
                jumlah: 400000,
            },
            {
                aktivitas: "Layanan Kantor",
                sub_aktivitas: "Cetak KTM",
                tahun: 2023,
                jumlah: 350000,
            },
        ];
        it("should success return simplified fund usages", async () => {
            mockedDatabase.models.penggunaan_dana.findAll =
                mockData.findAllSimplified;

            const simplifiedFundUsages =
                await fundUsageQueryHandler.getSimplifiedFundUsages(
                    fundUsageYear,
                );

            expect(
                mockedDatabase.models.penggunaan_dana.findAll,
            ).toHaveBeenCalled();
            expect(simplifiedFundUsages).toEqual(simplifiedFundUsagesResult);
        });

        it("should error return all fund usage datas", async () => {
            mockedDatabase.models.penggunaan_dana.findAll =
                mockData.findAllSimplifiedError;

            try {
                await fundUsageQueryHandler.getSimplifiedFundUsages(
                    fundUsageYear,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.penggunaan_dana.findAll,
                ).toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
