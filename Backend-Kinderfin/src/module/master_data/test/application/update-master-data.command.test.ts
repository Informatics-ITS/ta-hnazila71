import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import {
    UpdateMasterDataCommand,
    UpdateMasterDataCommandHandler,
} from "../../application/command";
import { MasterDataEntity, MasterDataProps } from "../../domain/entity";
import { IMasterDataRepository } from "../../domain/repository";
import { MasterDataRepository } from "../../infrastructure/storage/repository";
import { MasterDataService } from "../../domain/service";

describe("Testing Update Master Data Command", () => {
    const oldMasterData: MasterDataProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        tipe: "Jenis Pembayaran",
        nilai: "Daftar Ujian",
        aturan: "Nomor Pendaftaran",
        deskripsi: "Jenis pembayaran untuk pendaftaran calon mahasiswa PIKTI",
    };

    const masterDataRequested: UpdateMasterDataCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nilai: "Daftar Ulang",
        aturan: "Nomor Pendaftaran",
        deskripsi: "Jenis pembayaran untuk mahasiswa baru PIKTI",
    };

    const masterDataResult = new MasterDataEntity<MasterDataProps>({
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nilai: "Daftar Ulang",
        aturan: "Nomor Pendaftaran",
        deskripsi: "Jenis pembayaran untuk mahasiswa baru PIKTI",
    } as MasterDataProps);

    const mockData = {
        masterDataExist: jest.fn().mockReturnValue(oldMasterData),
        masterDataValueExist: jest.fn().mockReturnValue(Error("Data master telah dimasukkan")),
        masterDataNotExist: jest.fn().mockReturnValue(null),
        updateMasterData: jest.fn(),
        updateMasterDataError: jest
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
    let updateMasterDataCommandHandler: ICommandHandler<
        UpdateMasterDataCommand,
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
            isMasterDataIdExist: mockData.masterDataExist,
            updateMasterData: mockData.updateMasterData,
        } as any;
        updateMasterDataCommandHandler = new UpdateMasterDataCommandHandler(
            masterDataRepository,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    jest.mock("../../domain/service");
    let mockedMasterDataService: jest.MockedClass<typeof MasterDataService>;
    const [masterDataId, type, value] = [
        "3679285c-707c-42ed-9c6e-9984825b22fd",
        "Jenis Pembayaran",
        "Daftar Ulang",
    ];
    describe("Execute Update Master Data", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockedMasterDataService = MasterDataService as jest.MockedClass<
                typeof MasterDataService
            >;
            mockedMasterDataService.prototype.validateUniqueMasterData =
                mockData.masterDataNotExist;
        });
        it("should success execute update master data", async () => {
            await updateMasterDataCommandHandler.execute(masterDataRequested);

            expect(
                masterDataRepository.isMasterDataIdExist,
            ).toHaveBeenCalledWith(masterDataId);
            expect(
                mockedMasterDataService.prototype.validateUniqueMasterData,
            ).toHaveBeenCalledWith(type, value, masterDataRepository);
            expect(masterDataRepository.updateMasterData).toHaveBeenCalledWith(
                masterDataResult,
            );
        });

        it("should error execute update master data", async () => {
            masterDataRepository.updateMasterData =
                mockData.updateMasterDataError;

            try {
                await updateMasterDataCommandHandler.execute(
                    masterDataRequested,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    masterDataRepository.isMasterDataIdExist,
                ).toHaveBeenCalledWith(masterDataId);
                expect(
                    mockedMasterDataService.prototype.validateUniqueMasterData,
                ).toHaveBeenCalledWith(type, value, masterDataRepository);
                expect(
                    masterDataRepository.updateMasterData,
                ).toHaveBeenCalledWith(masterDataResult);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update master data on duplicate master data", async () => {
            mockedMasterDataService.prototype.validateUniqueMasterData =
                mockData.masterDataValueExist;

            try {
                await updateMasterDataCommandHandler.execute(
                    masterDataRequested,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    masterDataRepository.isMasterDataIdExist,
                ).toHaveBeenCalledWith(masterDataId);
                expect(
                    mockedMasterDataService.prototype.validateUniqueMasterData,
                ).toHaveBeenCalledWith(type, value, masterDataRepository);
                expect(
                    masterDataRepository.updateMasterData,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual("Data master telah dimasukkan");
            }
        });

        it("should error execute update master data on master data not found", async () => {
            masterDataRepository.isMasterDataIdExist =
                mockData.masterDataNotExist;

            try {
                await updateMasterDataCommandHandler.execute(
                    masterDataRequested,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    masterDataRepository.isMasterDataIdExist,
                ).toHaveBeenCalledWith(masterDataId);
                expect(
                    masterDataRepository.updateMasterData,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.NOT_FOUND);
                expect(appErr.message).toEqual("Data master tidak ditemukan");
            }
        });
    });
});
