import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import { IBalanceSheetPostRepository } from "../../domain/repository";
import {
    BalanceSheetPostService,
    IBalanceSheetPostService,
} from "../../domain/service";
import { BalanceSheetPostRepository } from "../../infrastructure/storage/repository";

describe("Testing Balance Sheet Post Service", () => {
    const mockData = {
        balanceSheetPostYearExist: jest.fn().mockReturnValue(true),
        balanceSheetPostYearNotExist: jest.fn().mockReturnValue(false),
        balanceSheetPostError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockedDatabase: Sequelize;
    let balanceSheetPostRepository: IBalanceSheetPostRepository;
    let balanceSheetPostService: IBalanceSheetPostService;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        balanceSheetPostRepository = new BalanceSheetPostRepository(
            mockedDatabase,
        );
        balanceSheetPostRepository = {
            isBalanceSheetPostDataYearExist: mockData.balanceSheetPostYearExist,
        } as any;
        balanceSheetPostService = new BalanceSheetPostService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const year = 2023;
    describe("Validate Unique Balance Sheet Post", () => {
        it("should success return error duplicate balance sheet post", async () => {
            const result =
                await balanceSheetPostService.validateUniqueBalanceSheetYear(
                    year,
                    balanceSheetPostRepository,
                );

            expect(
                balanceSheetPostRepository.isBalanceSheetPostDataYearExist,
            ).toHaveBeenCalledWith(year);
            expect(result?.message).toEqual(
                "Data pos neraca 2023 telah dimasukkan",
            );
        });

        it("should success return not duplicate balance sheet post", async () => {
            balanceSheetPostRepository.isBalanceSheetPostDataYearExist =
                mockData.balanceSheetPostYearNotExist;

            const result =
                await balanceSheetPostService.validateUniqueBalanceSheetYear(
                    year,
                    balanceSheetPostRepository,
                );

            expect(
                balanceSheetPostRepository.isBalanceSheetPostDataYearExist,
            ).toHaveBeenCalledWith(year);
            expect(result).toBeNull();
        });

        it("should error validate balance sheet post", async () => {
            balanceSheetPostRepository.isBalanceSheetPostDataYearExist =
                mockData.balanceSheetPostError;

            try {
                await balanceSheetPostService.validateUniqueBalanceSheetYear(
                    year,
                    balanceSheetPostRepository,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    balanceSheetPostRepository.isBalanceSheetPostDataYearExist,
                ).toHaveBeenCalledWith(year);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
