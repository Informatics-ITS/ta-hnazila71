import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../shared/abstract";
import { MasterDataEntity, MasterDataProps } from "../../domain/entity";
import { IMasterDataRepository } from "../../domain/repository";
import { MasterDataRepository } from "../../infrastructure/storage/repository";

describe("Testing Master Data Repository", () => {
    const mockMasterData: MasterDataProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        tipe: "Jenis Pembayaran",
        nilai: "Daftar Ujian",
        aturan: "Nomor Pendaftaran",
        deskripsi: "Jenis pembayaran untuk pendaftaran calon mahasiswa PIKTI",
    };

    const masterDataRequested = new MasterDataEntity<MasterDataProps>({
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        tipe: "Jenis Pembayaran",
        nilai: "Daftar Ujian",
        aturan: "Nomor Pendaftaran",
        deskripsi: "Jenis pembayaran untuk calon mahasiswa PIKTI",
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
        find: jest.fn().mockReturnValue(mockMasterData),
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
    let masterDataRepository: IMasterDataRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.models.master_data = {
            create: mockData.modified,
            update: mockData.modified,
            destroy: mockData.modified,
            findByPk: mockData.find,
            findOne: mockData.find,
        } as any;
        masterDataRepository = new MasterDataRepository(mockedDatabase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const masterDataId = "3679285c-707c-42ed-9c6e-9984825b22fd";
    describe("Add Master Data", () => {
        it("should success add a master data", async () => {
            await masterDataRepository.addMasterData(masterDataRequested);

            expect(
                mockedDatabase.models.master_data.create,
            ).toHaveBeenCalledWith(masterDataRequested);
        });

        it("should error add a master data", async () => {
            mockedDatabase.models.master_data.create = mockData.modifiedError;

            try {
                await masterDataRepository.addMasterData(masterDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.master_data.create,
                ).toHaveBeenCalledWith(masterDataRequested);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Update Master Data", () => {
        it("should success update master data", async () => {
            await masterDataRepository.updateMasterData(masterDataRequested);

            expect(
                mockedDatabase.models.master_data.update,
            ).toHaveBeenCalledWith(masterDataRequested, {
                where: { id: masterDataId },
            });
        });

        it("should error update master data", async () => {
            mockedDatabase.models.master_data.update = mockData.modifiedError;

            try {
                await masterDataRepository.updateMasterData(
                    masterDataRequested,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.master_data.update,
                ).toHaveBeenCalledWith(masterDataRequested, {
                    where: { id: masterDataId },
                });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Delete Master Data", () => {
        it("should success delete master data", async () => {
            await masterDataRepository.deleteMasterData(masterDataId);

            expect(
                mockedDatabase.models.master_data.destroy,
            ).toHaveBeenCalledWith({ where: { id: masterDataId } });
        });

        it("should error delete master data", async () => {
            mockedDatabase.models.master_data.destroy = mockData.modifiedError;

            try {
                await masterDataRepository.deleteMasterData(masterDataId);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.master_data.destroy,
                ).toHaveBeenCalledWith({ where: { id: masterDataId } });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Check Master Data By Id", () => {
        it("should success return an master data by id", async () => {
            const master = await masterDataRepository.isMasterDataIdExist(
                masterDataId,
            );

            expect(
                mockedDatabase.models.master_data.findByPk,
            ).toHaveBeenCalledWith(masterDataId);
            expect(master).toEqual(mockMasterData);
        });

        it("should success return an empty master data by id", async () => {
            mockedDatabase.models.master_data.findByPk = mockData.findNull;

            const master = await masterDataRepository.isMasterDataIdExist(
                masterDataId,
            );

            expect(
                mockedDatabase.models.master_data.findByPk,
            ).toHaveBeenCalledWith(masterDataId);
            expect(master).toBeNull();
        });

        it("should error return an master data by id", async () => {
            mockedDatabase.models.master_data.findByPk = mockData.findError;

            try {
                await masterDataRepository.isMasterDataIdExist(masterDataId);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.master_data.findByPk,
                ).toHaveBeenCalledWith(masterDataId);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Check Master Data By Type", () => {
        const [masterDataType, masterDataValue] = [
            "Jenis Pembayaran",
            "Daftar Ujian",
        ];
        it("should success return true value", async () => {
            const value = await masterDataRepository.isMasterDataValueExist(
                masterDataType,
                masterDataValue,
            );

            expect(
                mockedDatabase.models.master_data.findOne,
            ).toHaveBeenCalledWith({
                where: { tipe: masterDataType, nilai: masterDataValue },
            });
            expect(value).toBeTruthy();
        });

        it("should success return false value", async () => {
            mockedDatabase.models.master_data.findOne = mockData.findNull;

            const value = await masterDataRepository.isMasterDataValueExist(
                masterDataType,
                masterDataValue,
            );

            expect(
                mockedDatabase.models.master_data.findOne,
            ).toHaveBeenCalledWith({
                where: { tipe: masterDataType, nilai: masterDataValue },
            });
            expect(value).toBeFalsy();
        });

        it("should error return an master data by type", async () => {
            mockedDatabase.models.master_data.findOne = mockData.findError;

            try {
                await masterDataRepository.isMasterDataValueExist(
                    masterDataType,
                    masterDataValue,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.master_data.findOne,
                ).toHaveBeenCalledWith({
                    where: { tipe: masterDataType, nilai: masterDataValue },
                });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
