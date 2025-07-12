import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import {
    DeleteMasterDataCommand,
    DeleteMasterDataCommandHandler,
} from "../../application/command";
import { MasterDataProps } from "../../domain/entity";
import { IMasterDataRepository } from "../../domain/repository";
import { MasterDataRepository } from "../../infrastructure/storage/repository";

describe("Testing Delete Master Data Command", () => {
    const oldMasterData: MasterDataProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        tipe: "Jenis Pembayaran",
        nilai: "Daftar Ujian",
        aturan: "Nomor Pendaftaran",
        deskripsi: "Jenis pembayaran untuk pendaftaran calon mahasiswa PIKTI",
    };

    const masterDataRequested: DeleteMasterDataCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
    };

    const mockData = {
        masterDataIdExist: jest.fn().mockReturnValue(oldMasterData),
        masterDataIdNotExist: jest.fn().mockReturnValue(null),
        deleteMasterData: jest.fn(),
        deleteMasterDataError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockedDatabase: Sequelize;
    let masterDataRepository: IMasterDataRepository;
    let deleteMasterDataCommandHandler: ICommandHandler<
        DeleteMasterDataCommand,
        void
    >;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        masterDataRepository = new MasterDataRepository(mockedDatabase);
        masterDataRepository = {
            isMasterDataIdExist: mockData.masterDataIdExist,
            deleteMasterData: mockData.deleteMasterData,
        } as any;
        deleteMasterDataCommandHandler = new DeleteMasterDataCommandHandler(
            masterDataRepository,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const masterDataId = "3679285c-707c-42ed-9c6e-9984825b22fd";
    describe("Execute Delete Master Data", () => {
        it("should success execute delete master data", async () => {
            await deleteMasterDataCommandHandler.execute(masterDataRequested);

            expect(
                masterDataRepository.isMasterDataIdExist,
            ).toHaveBeenCalledWith(masterDataId);
            expect(masterDataRepository.deleteMasterData).toHaveBeenCalledWith(
                masterDataId,
            );
        });

        it("should error execute delete master data", async () => {
            masterDataRepository.deleteMasterData =
                mockData.deleteMasterDataError;

            try {
                await deleteMasterDataCommandHandler.execute(masterDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    masterDataRepository.isMasterDataIdExist,
                ).toHaveBeenCalledWith(masterDataId);
                expect(
                    masterDataRepository.deleteMasterData,
                ).toHaveBeenCalledWith(masterDataId);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute delete master data on master data not found", async () => {
            masterDataRepository.isMasterDataIdExist =
                mockData.masterDataIdNotExist;

            try {
                await deleteMasterDataCommandHandler.execute(masterDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    masterDataRepository.isMasterDataIdExist,
                ).toHaveBeenCalledWith(masterDataId);
                expect(
                    masterDataRepository.deleteMasterData,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.NOT_FOUND);
                expect(appErr.message).toEqual("Data master tidak ditemukan");
            }
        });
    });
});
