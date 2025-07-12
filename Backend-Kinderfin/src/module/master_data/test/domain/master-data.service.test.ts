import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../shared/abstract";
import { IMasterDataRepository } from "../../domain/repository";
import { IMasterDataService, MasterDataService } from "../../domain/service";
import { MasterDataRepository } from "../../infrastructure/storage/repository";

describe("Testing Master Data Service", () => {
    const mockData = {
        masterDataValueExist: jest.fn().mockReturnValue(true),
        masterDataValueNotExist: jest.fn().mockReturnValue(false),
        masterDataError: jest
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
    let masterDataService: IMasterDataService;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        masterDataRepository = new MasterDataRepository(mockedDatabase);
        masterDataRepository = {
            isMasterDataValueExist: mockData.masterDataValueExist,
        } as any;
        masterDataService = new MasterDataService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const [type, value] = ["Jenis Pembayaran", "Daftar Ujian"];
    describe("Validate Unique Master Data", () => {
        it("should success return error duplicate master data", async () => {
            const result = await masterDataService.validateUniqueMasterData(
                type,
                value,
                masterDataRepository,
            );

            expect(
                masterDataRepository.isMasterDataValueExist,
            ).toHaveBeenCalledWith(type, value);
            expect(result?.message).toEqual("Data master telah dimasukkan");
        });

        it("should success return not duplicate master data", async () => {
            masterDataRepository.isMasterDataValueExist =
                mockData.masterDataValueNotExist;

            const result = await masterDataService.validateUniqueMasterData(
                type,
                value,
                masterDataRepository,
            );

            expect(
                masterDataRepository.isMasterDataValueExist,
            ).toHaveBeenCalledWith(type, value);
            expect(result).toBeNull();
        });

        it("should error validate master data", async () => {
            masterDataRepository.isMasterDataValueExist =
                mockData.masterDataError;

            try {
                await masterDataService.validateUniqueMasterData(
                    type,
                    value,
                    masterDataRepository,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    masterDataRepository.isMasterDataValueExist,
                ).toHaveBeenCalledWith(type, value);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
