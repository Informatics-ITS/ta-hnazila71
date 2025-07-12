import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import {
    FundApplicationEntity,
    FundApplicationProps,
} from "../../domain/entity";
import { IFundApplicationRepository } from "../../domain/repository";
import { FundApplicationRepository } from "../../infrastructure/storage/repository";

describe("Testing Fund Application Repository", () => {
    const mockFundApplicationData: FundApplicationProps = {
        id: "78bae457-6f69-44b6-83b0-fd6a38d69378",
        deskripsi: "Telepon PIKTI",
        unit: "Bulan",
        quantity_1: 1,
        quantity_2: 1,
        harga_satuan: 1600000,
        jumlah: 1600000,
    };

    const requestFundApplicationData =
        new FundApplicationEntity<FundApplicationProps>({
            id: "3679285c-707c-42ed-9c6e-9984825b22fd",
            bulan: 10,
            tahun: 2023,
            deskripsi: "Telepon PIKTI",
            unit: "Bulan",
            quantity_1: 1,
            quantity_2: 1,
            harga_satuan: 1560000,
        });
    requestFundApplicationData.calculateJumlah();

    const mockData = {
        fundApplicationIdNotExist: jest.fn().mockReturnValue(null),
        modified: jest.fn(),
        modifiedError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        findByPk: jest.fn().mockReturnValue(mockFundApplicationData),
        findByPkNull: jest.fn().mockReturnValue(null),
        findByPkError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockedDatabase: Sequelize;
    let fundApplicationRepository: IFundApplicationRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.models.pengajuan_dana = {
            create: mockData.modified,
            update: mockData.modified,
            destroy: mockData.modified,
            findByPk: mockData.findByPk,
        } as any;
        fundApplicationRepository = new FundApplicationRepository(
            mockedDatabase,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const fundApplicationId = "3679285c-707c-42ed-9c6e-9984825b22fd";
    describe("Add Fund Application", () => {
        it("should success add a fund application data", async () => {
            await fundApplicationRepository.addFundApplication(
                requestFundApplicationData,
            );

            expect(
                mockedDatabase.models.pengajuan_dana.create,
            ).toHaveBeenCalledWith({
                ...requestFundApplicationData,
                jumlah: requestFundApplicationData.getJumlah()!.getAmount(),
            });
        });

        it("should error add a fund application data", async () => {
            mockedDatabase.models.pengajuan_dana.create =
                mockData.modifiedError;

            try {
                await fundApplicationRepository.addFundApplication(
                    requestFundApplicationData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.pengajuan_dana.create,
                ).toHaveBeenCalledWith({
                    ...requestFundApplicationData,
                    jumlah: requestFundApplicationData.getJumlah()!.getAmount(),
                });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Update Fund Application", () => {
        it("should success update fund application data", async () => {
            await fundApplicationRepository.updateFundApplication(
                requestFundApplicationData,
            );

            expect(
                mockedDatabase.models.pengajuan_dana.update,
            ).toHaveBeenCalledWith(
                {
                    ...requestFundApplicationData,
                    jumlah: requestFundApplicationData.getJumlah()!.getAmount(),
                },
                {
                    where: { id: fundApplicationId },
                },
            );
        });

        it("should error update fund application data", async () => {
            mockedDatabase.models.pengajuan_dana.update =
                mockData.modifiedError;

            try {
                await fundApplicationRepository.updateFundApplication(
                    requestFundApplicationData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.pengajuan_dana.update,
                ).toHaveBeenCalledWith(
                    {
                        ...requestFundApplicationData,
                        jumlah: requestFundApplicationData
                            .getJumlah()!
                            .getAmount(),
                    },
                    {
                        where: { id: fundApplicationId },
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Delete Fund Application", () => {
        it("should success delete fund application data", async () => {
            await fundApplicationRepository.deleteFundApplication(
                fundApplicationId,
            );

            expect(
                mockedDatabase.models.pengajuan_dana.destroy,
            ).toHaveBeenCalledWith({ where: { id: fundApplicationId } });
        });

        it("should error delete fund application data", async () => {
            mockedDatabase.models.pengajuan_dana.destroy =
                mockData.modifiedError;

            try {
                await fundApplicationRepository.deleteFundApplication(
                    fundApplicationId,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.pengajuan_dana.destroy,
                ).toHaveBeenCalledWith({ where: { id: fundApplicationId } });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Check Fund Application Data By Id", () => {
        it("should success return a fund application data by id", async () => {
            const fundApplication =
                await fundApplicationRepository.isFundApplicationIdExist(
                    fundApplicationId,
                );

            expect(
                mockedDatabase.models.pengajuan_dana.findByPk,
            ).toHaveBeenCalledWith(fundApplicationId);
            expect(fundApplication).toEqual(mockFundApplicationData);
        });

        it("should success return an empty fund application data by id", async () => {
            mockedDatabase.models.pengajuan_dana.findByPk =
                mockData.findByPkNull;

            const fundApplication =
                await fundApplicationRepository.isFundApplicationIdExist(
                    fundApplicationId,
                );

            expect(
                mockedDatabase.models.pengajuan_dana.findByPk,
            ).toHaveBeenCalledWith(fundApplicationId);
            expect(fundApplication).toBeNull();
        });

        it("should error return a fund application data by id", async () => {
            mockedDatabase.models.pengajuan_dana.findByPk =
                mockData.findByPkError;

            try {
                await fundApplicationRepository.isFundApplicationIdExist(
                    fundApplicationId,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.pengajuan_dana.findByPk,
                ).toHaveBeenCalledWith(fundApplicationId);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
