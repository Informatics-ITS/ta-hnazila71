import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as httpMocks from "node-mocks-http";
import { Sequelize } from "sequelize";
import { ApplicationError, DefaultMessage } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import { GenerateBudgetEstimatePlanCommandHandler } from "../../application/command";
import {
    AllBudgetEstimatePlansResult,
    BudgetEstimatePlanResult,
    IBudgetEstimatePlanQueryHandler,
} from "../../application/query";
import { IBudgetEstimatePlanRepository } from "../../domain/repository";
import { BudgetEstimatePlanQueryHandler } from "../../infrastructure/storage/query";
import { BudgetEstimatePlanRepository } from "../../infrastructure/storage/repository";
import { BudgetEstimatePlanController } from "../../presentation/controller";

describe("Testing Budget Estimate Plan Controller", () => {
    const budgetEstimatePlanResult: BudgetEstimatePlanResult[] = [
        {
            aktivitas: "Honorarium",
            sub_aktivitas: ["HR Test"],
            jumlah: [3400000],
            total: 3400000,
        },
        {
            aktivitas: "Layanan Kantor",
            sub_aktivitas: ["Cetak KTM", "Pulsa"],
            jumlah: [350000, 400000],
            total: 750000,
        },
    ];

    const budgetEstimatePlanDatas: AllBudgetEstimatePlansResult = {
        rencana_anggaran_biaya: budgetEstimatePlanResult,
        total: 4150000,
    };

    const sentMessage = {
        success: {
            view: {
                status: "success",
                message: DefaultMessage.SUC_AGET,
                data: budgetEstimatePlanDatas,
            },
        },
        failed: {
            status: "failed",
            error: "Internal Server Error",
        },
    };

    const mockData = {
        execute: jest.fn().mockReturnValue(true),
        executeFalse: jest.fn().mockReturnValue(false),
        executeError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        json: jest.fn(),
        getAllBudgetEstimatePlans: jest
            .fn()
            .mockReturnValue(budgetEstimatePlanDatas),
        getAllBudgetEstimatePlansError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockRequest: Request;
    let mockResponse: Response;
    let mockedDatabase: Sequelize;
    let budgetEstimatePlanRepository: IBudgetEstimatePlanRepository;
    let budgetEstimatePlanQueryHandler: IBudgetEstimatePlanQueryHandler;
    let eventBus: EventBus;
    let budgetEstimatePlanController: BudgetEstimatePlanController;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        budgetEstimatePlanRepository = new BudgetEstimatePlanRepository(
            mockedDatabase,
        );
        budgetEstimatePlanQueryHandler = new BudgetEstimatePlanQueryHandler(
            mockedDatabase,
        );
        budgetEstimatePlanQueryHandler = {
            getAllBudgetEstimatePlans: mockData.getAllBudgetEstimatePlans,
        } as any;
        eventBus = new EventBus();
        budgetEstimatePlanController = new BudgetEstimatePlanController(
            budgetEstimatePlanRepository,
            budgetEstimatePlanQueryHandler,
            eventBus,
        );
        mockResponse = httpMocks.createResponse();
        mockResponse.json = mockData.json;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    jest.mock("../../application/command");
    const [budgetEstimatePlanYear, budgetEstimatePlanRequestedData] = [
        2023,
        { tahun: 2023 },
    ];
    let mockedGenerateBudgetEstimatePlanCommandHandler: jest.MockedClass<
        typeof GenerateBudgetEstimatePlanCommandHandler
    >;
    describe("Generate Budget Estimate Plan Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, budgetEstimatePlanRequestedData),
            });
            mockedGenerateBudgetEstimatePlanCommandHandler =
                GenerateBudgetEstimatePlanCommandHandler as jest.MockedClass<
                    typeof GenerateBudgetEstimatePlanCommandHandler
                >;
            mockedGenerateBudgetEstimatePlanCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success return response generate budget estimate plan", async () => {
            await budgetEstimatePlanController.generateBudgetEstimatePlans(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedGenerateBudgetEstimatePlanCommandHandler.prototype
                    .execute,
            ).toHaveBeenCalledWith(budgetEstimatePlanRequestedData);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "success",
                message: `Data rencana anggaran biaya tahun ${budgetEstimatePlanYear} berhasil digenerate`,
            });
        });

        it("should error return response generate budget estimate plan on generate data", async () => {
            mockedGenerateBudgetEstimatePlanCommandHandler.prototype.execute =
                mockData.executeFalse;

            await budgetEstimatePlanController.generateBudgetEstimatePlans(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedGenerateBudgetEstimatePlanCommandHandler.prototype
                    .execute,
            ).toHaveBeenCalledWith(budgetEstimatePlanRequestedData);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.NOT_FOUND);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "failed",
                error: `Data yang akan digenerate untuk rencana anggaran biaya tahun ${budgetEstimatePlanYear} tidak ditemukan`,
            });
        });

        it("should error return response generate budget estimate plan on validate request", async () => {
            mockRequest = httpMocks.createRequest();

            await budgetEstimatePlanController.generateBudgetEstimatePlans(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedGenerateBudgetEstimatePlanCommandHandler.prototype
                    .execute,
            ).not.toHaveBeenCalled();
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: "failed",
                }),
            );
        });
    });

    const tahun = "2023";
    describe("View All Budget Estimate Plans Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                query: Object.assign({}, { tahun: tahun }),
            });
        });

        it("should success return response view all budget estimate plans", async () => {
            await budgetEstimatePlanController.viewAllBudgetEstimatePlans(
                mockRequest,
                mockResponse,
            );

            expect(
                budgetEstimatePlanQueryHandler.getAllBudgetEstimatePlans,
            ).toHaveBeenCalledWith(parseInt(tahun));
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.view,
            );
        });

        it("should error return response view all budget estimate plans", async () => {
            budgetEstimatePlanQueryHandler.getAllBudgetEstimatePlans =
                mockData.getAllBudgetEstimatePlansError;

            await budgetEstimatePlanController.viewAllBudgetEstimatePlans(
                mockRequest,
                mockResponse,
            );

            expect(
                budgetEstimatePlanQueryHandler.getAllBudgetEstimatePlans,
            ).toHaveBeenCalledWith(parseInt(tahun));
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response view all budget estimate plans on validate request", async () => {
            mockRequest = httpMocks.createRequest();

            await budgetEstimatePlanController.viewAllBudgetEstimatePlans(
                mockRequest,
                mockResponse,
            );

            expect(
                budgetEstimatePlanQueryHandler.getAllBudgetEstimatePlans,
            ).not.toHaveBeenCalled();
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: "failed",
                }),
            );
        });
    });
});
