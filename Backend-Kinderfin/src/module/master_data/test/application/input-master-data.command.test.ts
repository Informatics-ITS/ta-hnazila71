import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import {
    InputMasterDataCommand,
    InputMasterDataCommandHandler,
} from "../../application/command";
import { MasterDataEntity, MasterDataProps } from "../../domain/entity";
import { IMasterDataRepository } from "../../domain/repository";
import { MasterDataService } from "../../domain/service";
import { MasterDataRepository } from "../../infrastructure/storage/repository";

describe("Testing Input Master Data Command", () => {
    const oldMasterData: MasterDataProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        tipe: "Jenis Pembayaran",
        nilai: "Daftar Ujian",
        aturan: "Nomor Pendaftaran",
        deskripsi: "Jenis pembayaran untuk pendaftaran calon mahasiswa PIKTI",
    };

    const masterDataRequested: InputMasterDataCommand = {
        tipe: "Jenis Pembayaran",
        nilai: "Daftar Ujian",
        aturan: "Nomor Pendaftaran",
        deskripsi: "Jenis pembayaran untuk calon mahasiswa PIKTI",
    };

    const masterDataResult = new MasterDataEntity<MasterDataProps>({
        tipe: "Jenis Pembayaran",
        nilai: "Daftar Ujian",
        aturan: "Nomor Pendaftaran",
        deskripsi: "Jenis pembayaran untuk calon mahasiswa PIKTI",
    } as MasterDataProps);

    const mockData = {
        masterDataValueExist: jest.fn().mockReturnValue(Error("Data master telah dimasukkan")),
        masterDataValueNotExist: jest.fn().mockReturnValue(null),
        addMasterData: jest.fn(),
        addMasterDataError: jest
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
    let inputMasterDataCommandHandler: ICommandHandler<
        InputMasterDataCommand,
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
            addMasterData: mockData.addMasterData,
        } as any;
        inputMasterDataCommandHandler = new InputMasterDataCommandHandler(
            masterDataRepository,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    jest.mock("../../domain/service");
    let mockedMasterDataService: jest.MockedClass<typeof MasterDataService>;
    const [type, value] = ["Jenis Pembayaran", "Daftar Ujian"];
    describe("Execute Input Master Data", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockedMasterDataService = MasterDataService as jest.MockedClass<
                typeof MasterDataService
            >;
            mockedMasterDataService.prototype.validateUniqueMasterData =
                mockData.masterDataValueNotExist;
        });
        it("should success execute input master data", async () => {
            await inputMasterDataCommandHandler.execute(masterDataRequested);

            expect(
                mockedMasterDataService.prototype.validateUniqueMasterData,
            ).toHaveBeenCalledWith(type, value, masterDataRepository);
            expect(masterDataRepository.addMasterData).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...masterDataResult,
                    id: expect.anything(),
                }),
            );
        });

        it("should error execute input master data", async () => {
            masterDataRepository.addMasterData = mockData.addMasterDataError;

            try {
                await inputMasterDataCommandHandler.execute(
                    masterDataRequested,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedMasterDataService.prototype.validateUniqueMasterData,
                ).toHaveBeenCalledWith(type, value, masterDataRepository);
                expect(masterDataRepository.addMasterData).toHaveBeenCalledWith(
                    expect.objectContaining({
                        ...masterDataResult,
                        id: expect.anything(),
                    }),
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute input master data on duplicate master data", async () => {
            mockedMasterDataService.prototype.validateUniqueMasterData =
                mockData.masterDataValueExist;

            try {
                await inputMasterDataCommandHandler.execute(
                    masterDataRequested,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedMasterDataService.prototype.validateUniqueMasterData,
                ).toHaveBeenCalledWith(type, value, masterDataRepository);
                expect(
                    masterDataRepository.addMasterData,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual("Data master telah dimasukkan");
            }
        });
    });
});
