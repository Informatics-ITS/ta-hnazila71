import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import { FundUsageEntity, FundUsageProps } from "../../domain/entity";
import { IFundUsageRepository } from "../../domain/repository";
import { FundUsageRepository } from "../../infrastructure/storage/repository";

describe("Testing Fund Usage Repository", () => {
    const mockFundUsageData = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        aktivitas: "Layanan Kantor",
        tanggal: new Date("2023-10-12"),
        penerima: "Alpha",
        sub_aktivitas: "Cetak KTM",
        uraian: "Cetak KTM atas nama Alpha",
        jumlah: 350000,
    };

    const requestFundUsageData = new FundUsageEntity<FundUsageProps>({
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        aktivitas: "Layanan Kantor",
        tanggal: new Date("2023-10-12"),
        penerima: "Alpha",
        sub_aktivitas: "Cetak KTM",
        uraian: "Cetak KTM atas nama Alpha",
        jumlah: 350000,
    });

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
        find: jest.fn().mockReturnValue(mockFundUsageData),
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
    let fundUsageRepository: IFundUsageRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.models.penggunaan_dana = {
            create: mockData.modified,
            update: mockData.modified,
            destroy: mockData.modified,
            findByPk: mockData.find,
            findOne: mockData.find,
        } as any;
        fundUsageRepository = new FundUsageRepository(mockedDatabase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const fundUsageId = "3679285c-707c-42ed-9c6e-9984825b22fd";
    describe("Add Fund Usage", () => {
        it("should success add a fund usage data", async () => {
            await fundUsageRepository.addFundUsage(requestFundUsageData);

            expect(
                mockedDatabase.models.penggunaan_dana.create,
            ).toHaveBeenCalledWith(requestFundUsageData);
        });

        it("should error add a fund usage data", async () => {
            mockedDatabase.models.penggunaan_dana.create =
                mockData.modifiedError;

            try {
                await fundUsageRepository.addFundUsage(requestFundUsageData);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.penggunaan_dana.create,
                ).toHaveBeenCalledWith(requestFundUsageData);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Update Fund Usage", () => {
        it("should success update fund usage data", async () => {
            await fundUsageRepository.updateFundUsage(requestFundUsageData);

            expect(
                mockedDatabase.models.penggunaan_dana.update,
            ).toHaveBeenCalledWith(requestFundUsageData, {
                where: { id: fundUsageId },
            });
        });

        it("should error update fund usage data", async () => {
            mockedDatabase.models.penggunaan_dana.update =
                mockData.modifiedError;

            try {
                await fundUsageRepository.updateFundUsage(requestFundUsageData);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.penggunaan_dana.update,
                ).toHaveBeenCalledWith(requestFundUsageData, {
                    where: { id: fundUsageId },
                });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Delete Fund Usage", () => {
        it("should success delete fund usage data", async () => {
            await fundUsageRepository.deleteFundUsage(fundUsageId);

            expect(
                mockedDatabase.models.penggunaan_dana.destroy,
            ).toHaveBeenCalledWith({ where: { id: fundUsageId } });
        });

        it("should error delete fund usage data", async () => {
            mockedDatabase.models.penggunaan_dana.destroy =
                mockData.modifiedError;

            try {
                await fundUsageRepository.deleteFundUsage(fundUsageId);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.penggunaan_dana.destroy,
                ).toHaveBeenCalledWith({ where: { id: fundUsageId } });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Check Fund Usage Data By Id", () => {
        it("should success return a fund usage data by id", async () => {
            const fundUsage = await fundUsageRepository.isFundUsageIdExist(
                fundUsageId,
            );

            expect(
                mockedDatabase.models.penggunaan_dana.findByPk,
            ).toHaveBeenCalledWith(fundUsageId);
            expect(fundUsage).toEqual(mockFundUsageData);
        });

        it("should success return a empty fund usage data by id", async () => {
            mockedDatabase.models.penggunaan_dana.findByPk = mockData.findNull;

            const fundUsage = await fundUsageRepository.isFundUsageIdExist(
                fundUsageId,
            );

            expect(
                mockedDatabase.models.penggunaan_dana.findByPk,
            ).toHaveBeenCalledWith(fundUsageId);
            expect(fundUsage).toBeNull();
        });

        it("should error return a fund usage data by id", async () => {
            mockedDatabase.models.penggunaan_dana.findByPk = mockData.findError;

            try {
                await fundUsageRepository.isFundUsageIdExist(fundUsageId);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.penggunaan_dana.findByPk,
                ).toHaveBeenCalledWith(fundUsageId);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Check Fund Usage Data By Same HR", () => {
        const [subActivity, fundUsageMonth, fundUsageYear, receiver] = [
            "HR Test",
            10,
            2023,
            "Test User",
        ];
        it("should success return true value", async () => {
            const fundUsage = await fundUsageRepository.isFundUsageSameHRExist(
                subActivity,
                fundUsageMonth,
                fundUsageYear,
                receiver,
            );

            expect(
                mockedDatabase.models.penggunaan_dana.findOne,
            ).toHaveBeenCalled();
            expect(fundUsage).toBeTruthy();
        });

        it("should success return false value", async () => {
            mockedDatabase.models.penggunaan_dana.findOne = mockData.findNull;

            const fundUsage = await fundUsageRepository.isFundUsageSameHRExist(
                subActivity,
                fundUsageMonth,
                fundUsageYear,
                receiver,
            );

            expect(
                mockedDatabase.models.penggunaan_dana.findOne,
            ).toHaveBeenCalled();
            expect(fundUsage).toBeFalsy();
        });

        it("should error return a fund usage data by same HR", async () => {
            mockedDatabase.models.penggunaan_dana.findOne = mockData.findError;

            try {
                await fundUsageRepository.isFundUsageSameHRExist(
                    subActivity,
                    fundUsageMonth,
                    fundUsageYear,
                    receiver,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.penggunaan_dana.findOne,
                ).toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
