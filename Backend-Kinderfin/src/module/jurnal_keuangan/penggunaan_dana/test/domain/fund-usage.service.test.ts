import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import { IFundUsageRepository } from "../../domain/repository";
import { FundUsageService, IFundUsageService } from "../../domain/service";
import { FundUsageRepository } from "../../infrastructure/storage/repository";

describe("Testing Fund Usage Service", () => {
    const mockData = {
        fundUsageSameHRExist: jest.fn().mockReturnValue(true),
        fundUsageSameHRNotExist: jest.fn().mockReturnValue(false),
        fundUsageSameHRError: jest
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
    let fundUsageService: IFundUsageService;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        fundUsageRepository = new FundUsageRepository(mockedDatabase);
        fundUsageRepository = {
            isFundUsageSameHRExist: mockData.fundUsageSameHRExist,
        } as any;
        fundUsageService = new FundUsageService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const [subActivity, usageMonth, usageYear, receiver] = [
        "Honorarium Test",
        10,
        2023,
        "Test User",
    ];
    describe("Validate Unique Fund Usage HR", () => {
        it("should success return error duplicate fund usage same HR", async () => {
            const result = await fundUsageService.validateUniqueFundUsageHR(
                subActivity,
                usageMonth,
                usageYear,
                receiver,
                fundUsageRepository,
            );

            expect(
                fundUsageRepository.isFundUsageSameHRExist,
            ).toHaveBeenCalledWith(
                subActivity,
                usageMonth,
                usageYear,
                receiver,
            );
            expect(result?.message).toEqual(
                "Data penggunaan dana untuk sub aktivitas Honorarium Test kepada Test User pada Oktober 2023 telah dilaporkan",
            );
        });

        it("should success return not duplicate fund usage same HR", async () => {
            fundUsageRepository.isFundUsageSameHRExist =
                mockData.fundUsageSameHRNotExist;

            const result = await fundUsageService.validateUniqueFundUsageHR(
                subActivity,
                usageMonth,
                usageYear,
                receiver,
                fundUsageRepository,
            );

            expect(
                fundUsageRepository.isFundUsageSameHRExist,
            ).toHaveBeenCalledWith(
                subActivity,
                usageMonth,
                usageYear,
                receiver,
            );
            expect(result).toBeNull();
        });

        it("should error validate fund usage same HR", async () => {
            fundUsageRepository.isFundUsageSameHRExist =
                mockData.fundUsageSameHRError;

            try {
                await fundUsageService.validateUniqueFundUsageHR(
                    subActivity,
                    usageMonth,
                    usageYear,
                    receiver,
                    fundUsageRepository,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageSameHRExist,
                ).toHaveBeenCalledWith(
                    subActivity,
                    usageMonth,
                    usageYear,
                    receiver,
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
