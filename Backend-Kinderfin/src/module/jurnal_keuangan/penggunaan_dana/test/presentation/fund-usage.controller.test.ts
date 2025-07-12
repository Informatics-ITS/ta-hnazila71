import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as httpMocks from "node-mocks-http";
import { Sequelize } from "sequelize";
import {
    ApplicationError,
    DefaultMessage,
} from "../../../../../shared/abstract";
import { EventBus } from "../../../../../shared/util";
import {
    DeleteFundUsageCommandHandler,
    ReportFundUsageCommandHandler,
    UpdateFundUsageCommandHandler,
} from "../../application/command";
import { IFundUsageQueryHandler } from "../../application/query";
import { FundUsageProps } from "../../domain/entity";
import {
    BudgetEstimatePlanRetrievedEvent,
    MonthlyFundUsageRetrievedEvent,
    MonthlyFundUsageValue,
    SimplifiedFundUsagesResult,
} from "../../domain/event";
import { IFundUsageRepository } from "../../domain/repository";
import { FundUsageQueryHandler } from "../../infrastructure/storage/query";
import { FundUsageRepository } from "../../infrastructure/storage/repository";
import { FundUsageController } from "../../presentation/controller";

describe("Testing Fund Usage Controller", () => {
    const fundUsageDataResult: FundUsageProps[] = [
        {
            id: "1b0cce47-e920-4876-b32c-0547b09f6db1",
            aktivitas: "Honorarium",
            tanggal: new Date("2023-10-12"),
            penerima: "Test User",
            sub_aktivitas: "HR Test",
            uraian: "Honorarium Test PIKTI Oktober 2023",
            jumlah: 1500000,
        },
        {
            id: "0b79f9a5-1b2a-49fb-8ec4-ba177b2d4923",
            aktivitas: "Layanan Kantor",
            tanggal: new Date("2023-10-12"),
            penerima: "Alpha",
            sub_aktivitas: "Cetak KTM",
            uraian: "Cetak KTM atas nama Alpha",
            jumlah: 350000,
        },
    ];

    const fundUsageDataRetrieved: MonthlyFundUsageValue[] = [
        {
            bulan: 8,
            total: 8000000,
        },
        {
            bulan: 10,
            total: 16600000,
        },
    ];

    const budgetEstimatePlanRetrieved: SimplifiedFundUsagesResult[] = [
        {
            aktivitas: "Honorarium",
            sub_aktivitas: "HR Test",
            tahun: 2023,
            jumlah: 3500000,
        },
        {
            aktivitas: "Layanan Kantor",
            sub_aktivitas: "Pulsa",
            tahun: 2023,
            jumlah: 400000,
        },
        {
            aktivitas: "Layanan Kantor",
            sub_aktivitas: "Cetak KTM",
            tahun: 2023,
            jumlah: 350000,
        },
    ];

    const sentMessage = {
        success: {
            report: {
                status: "success",
                message: DefaultMessage.SUC_ADD,
            },
            view: {
                status: "success",
                message: DefaultMessage.SUC_AGET,
                data: fundUsageDataResult,
            },
            update: {
                status: "success",
                message: DefaultMessage.SUC_UPDT,
            },
            delete: {
                status: "success",
                message: DefaultMessage.SUC_DEL,
            },
        },
        failed: {
            status: "failed",
            error: "Internal Server Error",
        },
    };

    const mockData = {
        execute: jest.fn(),
        executeError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        json: jest.fn(),
        publish: jest.fn(),
        getAllFundUsages: jest.fn().mockReturnValue(fundUsageDataResult),
        getFundUsageDataById: jest.fn().mockReturnValue(fundUsageDataResult[0]),
        getFundUsageDataBySameHR: jest
            .fn()
            .mockReturnValue(fundUsageDataResult[0]),
        getFundUsageDataBySameHRNull: jest.fn().mockReturnValue(null),
        getSimplifiedFundUsages: jest
            .fn()
            .mockReturnValue(budgetEstimatePlanRetrieved),
        getMonthlyFundUsagesByYear: jest
            .fn()
            .mockReturnValue(fundUsageDataRetrieved),
        getError: jest
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
    let fundUsageRepository: IFundUsageRepository;
    let fundUsageQueryHandler: IFundUsageQueryHandler;
    let eventBus: EventBus;
    let fundUsageController: FundUsageController;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        fundUsageRepository = new FundUsageRepository(mockedDatabase);
        fundUsageQueryHandler = new FundUsageQueryHandler(mockedDatabase);
        fundUsageQueryHandler = {
            getAllFundUsages: mockData.getAllFundUsages,
            getFundUsageDataById: mockData.getFundUsageDataById,
            getFundUsageDataBySameHR: mockData.getFundUsageDataBySameHRNull,
            getSimplifiedFundUsages: mockData.getSimplifiedFundUsages,
            getMonthlyFundUsagesByYear: mockData.getMonthlyFundUsagesByYear,
        } as any;
        eventBus = new EventBus();
        eventBus.publish = mockData.publish;
        fundUsageController = new FundUsageController(
            fundUsageRepository,
            fundUsageQueryHandler,
            eventBus,
        );
        mockResponse = httpMocks.createResponse();
        mockResponse.json = mockData.json;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    jest.mock("../../application/command");
    const [fundUsageYear, requestFundUsageData, requestFundUsageDataFail] = [
        2023,
        {
            aktivitas: "Honorarium",
            tanggal: "2023-10-12",
            penerima: "Test User",
            sub_aktivitas: "HR Test",
            uraian: "Honorarium Test PIKTI Oktober 2023",
            jumlah: 1500000,
        },
        {
            aktivitas: "Honorarium",
            tanggal: "12-10-2023",
            penerima: "Test User",
            sub_aktivitas: "HR Test",
            uraian: "Honorarium Test PIKTI Oktober 2023",
            jumlah: 1500000,
        },
    ];
    let mockedReportFundUsageCommandHandler: jest.MockedClass<
        typeof ReportFundUsageCommandHandler
    >;
    describe("Report Fund Usage Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, requestFundUsageData),
            });
            mockedReportFundUsageCommandHandler =
                ReportFundUsageCommandHandler as jest.MockedClass<
                    typeof ReportFundUsageCommandHandler
                >;
            mockedReportFundUsageCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success return response report fund usage", async () => {
            await fundUsageController.reportFundUsage(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedReportFundUsageCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...requestFundUsageData,
                tanggal: expect.anything(),
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.report,
            );
        });

        it("should error return response report fund usage on report data", async () => {
            mockedReportFundUsageCommandHandler.prototype.execute =
                mockData.executeError;

            await fundUsageController.reportFundUsage(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedReportFundUsageCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...requestFundUsageData,
                tanggal: expect.anything(),
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response report fund usage on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, requestFundUsageDataFail),
            });

            await fundUsageController.reportFundUsage(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedReportFundUsageCommandHandler.prototype.execute,
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

    const [bulan, tahun] = ["10", "2023"];
    describe("View All Fund usages Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                query: Object.assign({}, { bulan: bulan, tahun: tahun }),
            });
        });

        it("should success return response view all fund usages", async () => {
            await fundUsageController.viewAllFundUsages(
                mockRequest,
                mockResponse,
            );

            expect(fundUsageQueryHandler.getAllFundUsages).toHaveBeenCalledWith(
                parseInt(bulan),
                parseInt(tahun),
            );
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.view,
            );
        });

        it("should error return response view all fund usages", async () => {
            fundUsageQueryHandler.getAllFundUsages = mockData.getError;

            await fundUsageController.viewAllFundUsages(
                mockRequest,
                mockResponse,
            );

            expect(fundUsageQueryHandler.getAllFundUsages).toHaveBeenCalledWith(
                parseInt(bulan),
                parseInt(tahun),
            );
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response view all fund usages on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                query: Object.assign({}, { bulan: bulan }),
            });

            await fundUsageController.viewAllFundUsages(
                mockRequest,
                mockResponse,
            );

            expect(
                fundUsageQueryHandler.getAllFundUsages,
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

    const [
        requestSendBudgetEstimatePlan,
        budgetEstimatePlanRetrievedEventName,
    ] = [
            {
                data: { tahun: fundUsageYear },
                eventName: "BudgetEstimatePlanRequested",
            },
            "BudgetEstimatePlanRetrieved",
        ];
    const budgetEstimatePlanRetrievedSuccessEvent = new BudgetEstimatePlanRetrievedEvent(
        budgetEstimatePlanRetrieved,
        budgetEstimatePlanRetrievedEventName,
    );
    const budgetEstimatePlanRetrievedFailedEvent = {
        data: {
            status: "error",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
        },
        budgetEstimatePlanRetrievedEventName,
    };
    describe("Send Budget Estimate Plan Controller", () => {
        it("should success return response send budget estimate plan", async () => {
            await fundUsageController.sendBudgetEstimatePlan(
                requestSendBudgetEstimatePlan,
            );

            expect(
                fundUsageQueryHandler.getSimplifiedFundUsages,
            ).toHaveBeenCalledWith(fundUsageYear);
            expect(eventBus.publish).toHaveBeenCalledWith(
                budgetEstimatePlanRetrievedEventName,
                {
                    ...budgetEstimatePlanRetrievedSuccessEvent,
                    eventOccurred: expect.anything(),
                },
            );
        });

        it("should error return response send budget estimate plan", async () => {
            fundUsageQueryHandler.getSimplifiedFundUsages = mockData.getError;

            try {
                await fundUsageController.sendBudgetEstimatePlan(
                    requestSendBudgetEstimatePlan,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageQueryHandler.getSimplifiedFundUsages,
                ).toHaveBeenCalledWith(fundUsageYear);
                expect(eventBus.publish).not.toHaveBeenCalledWith(
                    budgetEstimatePlanRetrievedEventName,
                    {
                        ...budgetEstimatePlanRetrievedSuccessEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    budgetEstimatePlanRetrievedEventName,
                    {
                        ...budgetEstimatePlanRetrievedFailedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    const [requestSendFundUsageData, fundUsageDataRetrievedEventName] = [
        {
            data: { tahun: fundUsageYear },
            eventName: "MonthlyFundUsagesRequested",
        },
        "MonthlyFundUsagesRetrieved",
    ];
    const fundUsageDataRetrievedSuccessEvent =
        new MonthlyFundUsageRetrievedEvent(
            fundUsageDataRetrieved,
            fundUsageDataRetrievedEventName,
        );
    const fundUsageDataRetrievedFailedEvent = {
        data: {
            status: "error",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
        },
        fundUsageDataRetrievedEventName,
    };
    describe("Send Monthly Fund Usages Controller", () => {
        it("should success return response send monthly fund usages", async () => {
            await fundUsageController.sendMonthlyFundUsages(
                requestSendFundUsageData,
            );

            expect(
                fundUsageQueryHandler.getMonthlyFundUsagesByYear,
            ).toHaveBeenCalledWith(fundUsageYear);
            expect(eventBus.publish).toHaveBeenCalledWith(
                fundUsageDataRetrievedEventName,
                {
                    ...fundUsageDataRetrievedSuccessEvent,
                    eventOccurred: expect.anything(),
                },
            );
        });

        it("should error return response send monthly fund usages", async () => {
            fundUsageQueryHandler.getMonthlyFundUsagesByYear =
                mockData.getError;

            try {
                await fundUsageController.sendMonthlyFundUsages(
                    requestSendFundUsageData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageQueryHandler.getMonthlyFundUsagesByYear,
                ).toHaveBeenCalledWith(fundUsageYear);
                expect(eventBus.publish).not.toHaveBeenCalledWith(
                    fundUsageDataRetrievedEventName,
                    {
                        ...fundUsageDataRetrievedSuccessEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    fundUsageDataRetrievedEventName,
                    {
                        ...fundUsageDataRetrievedFailedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    const fundUsageId = "1b0cce47-e920-4876-b32c-0547b09f6db1";
    let mockedUpdateFundUsageCommandHandler: jest.MockedClass<
        typeof UpdateFundUsageCommandHandler
    >;
    describe("Update Fund Usage Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, requestFundUsageData),
                params: Object.assign({}, { id: fundUsageId }),
            });
            mockedUpdateFundUsageCommandHandler =
                UpdateFundUsageCommandHandler as jest.MockedClass<
                    typeof UpdateFundUsageCommandHandler
                >;
            mockedUpdateFundUsageCommandHandler.prototype.execute =
                mockData.execute;
        });
        it("should success return response update fund usage", async () => {
            await fundUsageController.updateFundUsage(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUpdateFundUsageCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...requestFundUsageData,
                id: fundUsageId,
                tanggal: expect.anything(),
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.update,
            );
        });

        it("should error return response update fund usage on update data", async () => {
            mockedUpdateFundUsageCommandHandler.prototype.execute =
                mockData.executeError;

            await fundUsageController.updateFundUsage(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUpdateFundUsageCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...requestFundUsageData,
                id: fundUsageId,
                tanggal: expect.anything(),
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response update fund usage on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, requestFundUsageDataFail),
                params: Object.assign(
                    {},
                    { id: "1b0cce47-e920-4876-b32c-0547b09f6db" },
                ),
            });

            await fundUsageController.updateFundUsage(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUpdateFundUsageCommandHandler.prototype.execute,
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

    let mockedDeleteFundUsageCommandHandler: jest.MockedClass<
        typeof DeleteFundUsageCommandHandler
    >;
    describe("Delete Fund Usage Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                params: Object.assign({}, { id: fundUsageId }),
            });
            mockedDeleteFundUsageCommandHandler =
                DeleteFundUsageCommandHandler as jest.MockedClass<
                    typeof DeleteFundUsageCommandHandler
                >;
            mockedDeleteFundUsageCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success return response delete fund usage", async () => {
            await fundUsageController.deleteFundUsage(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedDeleteFundUsageCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                id: fundUsageId,
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.delete,
            );
        });

        it("should error return response delete fund usage on delete data", async () => {
            mockedDeleteFundUsageCommandHandler.prototype.execute =
                mockData.executeError;

            await fundUsageController.deleteFundUsage(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedDeleteFundUsageCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                id: fundUsageId,
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response delete fund usage on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                params: Object.assign(
                    {},
                    { id: "1b0cce47-e920-4876-b32c-0547b09f6db" },
                ),
            });

            await fundUsageController.deleteFundUsage(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedDeleteFundUsageCommandHandler.prototype.execute,
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
