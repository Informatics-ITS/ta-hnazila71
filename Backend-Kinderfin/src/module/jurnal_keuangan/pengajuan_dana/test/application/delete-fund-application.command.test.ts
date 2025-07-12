import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import {
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import {
    DeleteFundApplicationCommand,
    DeleteFundApplicationCommandHandler,
} from "../../application/command";
import { FundApplicationProps } from "../../domain/entity";
import { IFundApplicationRepository } from "../../domain/repository";
import { FundApplicationRepository } from "../../infrastructure/storage/repository";

describe("Testing Delete Fund Application Command", () => {
    const oldFundApplicationData: FundApplicationProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        bulan: 10,
        tahun: 2023,
        deskripsi: "Telepon PIKTI",
        unit: "Bulan",
        quantity_1: 1,
        quantity_2: 1,
        harga_satuan: 1560000,
        jumlah: 1560000,
    };

    const requestFundApplicationData: DeleteFundApplicationCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
    };

    const mockData = {
        fundApplicationIdExist: jest
            .fn()
            .mockReturnValue(oldFundApplicationData),
        fundApplicationIdNotExist: jest.fn().mockReturnValue(null),
        deleteFundApplication: jest.fn(),
        deleteFundApplicationError: jest
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
    let deleteFundApplicationCommandHandler: ICommandHandler<
        DeleteFundApplicationCommand,
        void
    >;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        fundApplicationRepository = new FundApplicationRepository(
            mockedDatabase,
        );
        fundApplicationRepository = {
            isFundApplicationIdExist: mockData.fundApplicationIdExist,
            deleteFundApplication: mockData.deleteFundApplication,
        } as any;
        deleteFundApplicationCommandHandler =
            new DeleteFundApplicationCommandHandler(fundApplicationRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const fundApplicationId = "3679285c-707c-42ed-9c6e-9984825b22fd";
    describe("Execute Delete Fund Application", () => {
        it("should success execute delete fund application", async () => {
            await deleteFundApplicationCommandHandler.execute(
                requestFundApplicationData,
            );

            expect(
                fundApplicationRepository.isFundApplicationIdExist,
            ).toHaveBeenCalledWith(fundApplicationId);
            expect(
                fundApplicationRepository.deleteFundApplication,
            ).toHaveBeenCalledWith(fundApplicationId);
        });

        it("should error execute delete fund application", async () => {
            fundApplicationRepository.deleteFundApplication =
                mockData.deleteFundApplicationError;

            try {
                await deleteFundApplicationCommandHandler.execute(
                    requestFundApplicationData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundApplicationRepository.isFundApplicationIdExist,
                ).toHaveBeenCalledWith(fundApplicationId);
                expect(
                    fundApplicationRepository.deleteFundApplication,
                ).toHaveBeenCalledWith(fundApplicationId);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute delete fund application on empty fund application", async () => {
            fundApplicationRepository.isFundApplicationIdExist =
                mockData.fundApplicationIdNotExist;

            try {
                await deleteFundApplicationCommandHandler.execute(
                    requestFundApplicationData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundApplicationRepository.isFundApplicationIdExist,
                ).toHaveBeenCalledWith(fundApplicationId);
                expect(
                    fundApplicationRepository.deleteFundApplication,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.NOT_FOUND);
                expect(appErr.message).toEqual(
                    "Data pengajuan dana tidak ditemukan",
                );
            }
        });
    });
});
