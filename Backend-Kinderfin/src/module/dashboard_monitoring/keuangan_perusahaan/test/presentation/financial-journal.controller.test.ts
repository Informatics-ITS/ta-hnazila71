import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as httpMocks from "node-mocks-http";
import { ApplicationError } from "../../../../../shared/abstract";
import { EventBus } from "../../../../../shared/util";
import {
    MonitorBalanceSheetApplicationService,
    MonitorCashFlowStatisticApplicationService,
} from "../../application/query";
import {
    BalanceSheetEntity,
    CashFlowStatisticEntity,
} from "../../domain/entity";
import {
    Asset,
    FinancialStatictic,
    Liability,
} from "../../domain/value_object";
import { FinancialJournalController } from "../../presentation/controller";

describe("Testing Financial Journal Controller", () => {
    const cashFlowStatisticResult = new CashFlowStatisticEntity(2023);
    cashFlowStatisticResult.setRekapitulasiPengajuanDana([
        new FinancialStatictic(8, 12000000),
        new FinancialStatictic(10, 10000000),
        new FinancialStatictic(11, 11000000),
    ]);
    cashFlowStatisticResult.setRekapitulasiPenggunaanDana([
        new FinancialStatictic(8, 10000000),
        new FinancialStatictic(10, 5000000),
        new FinancialStatictic(11, 14000000),
    ]);

    const balanceSheetResult = new BalanceSheetEntity(2023);
    balanceSheetResult.setAktiva(
        new Asset(12000000, 1000000, 500000, 50000, 0),
    );
    balanceSheetResult.setTotalAktiva(13450000);
    balanceSheetResult.setPasiva(new Liability(500000, 700000, 12250000));
    balanceSheetResult.setTotalPasiva(13450000);

    const sentMessage = {
        success: {
            monitorCashFlowStatistic: {
                status: "success",
                message: "Berhasil mendapatkan statistik arus keuangan",
                data: cashFlowStatisticResult,
            },
            monitorBalanceSheet: {
                status: "success",
                message: "Berhasil mendapatkan neraca keuangan",
                data: balanceSheetResult,
            },
        },
        failed: {
            status: "failed",
            error: "Internal Server Error",
        },
    };

    const mockData = {
        executeCashFlowStatistic: jest
            .fn()
            .mockReturnValue(cashFlowStatisticResult),
        executeBalanceSheet: jest.fn().mockReturnValue(balanceSheetResult),
        executeError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        json: jest.fn(),
    };

    let mockRequest: Request;
    let mockResponse: Response;
    let eventBus: EventBus;

    let financialJournalController: FinancialJournalController;

    beforeEach(() => {
        jest.clearAllMocks();
        eventBus = new EventBus();
        financialJournalController = new FinancialJournalController(eventBus);
        mockResponse = httpMocks.createResponse();
        mockResponse.json = mockData.json;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const requestYear = 2023;
    let mockedMonitorCashFlowStatisticApplicationService: jest.MockedClass<
        typeof MonitorCashFlowStatisticApplicationService
    >;
    describe("Monitor Cash Flow Statistic Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                query: Object.assign({}, { tahun: requestYear }),
            });
            mockedMonitorCashFlowStatisticApplicationService =
                MonitorCashFlowStatisticApplicationService as jest.MockedClass<
                    typeof MonitorCashFlowStatisticApplicationService
                >;
            mockedMonitorCashFlowStatisticApplicationService.prototype.retrieveCashFlowStatistic =
                mockData.executeCashFlowStatistic;
        });

        it("should success return response monitor cash flow statistic", async () => {
            await financialJournalController.monitorCashFlowStatistic(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedMonitorCashFlowStatisticApplicationService.prototype
                    .retrieveCashFlowStatistic,
            ).toHaveBeenCalledWith(requestYear);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.monitorCashFlowStatistic,
            );
        });

        it("should error return response monitor cash flow statistic", async () => {
            mockedMonitorCashFlowStatisticApplicationService.prototype.retrieveCashFlowStatistic =
                mockData.executeError;

            await financialJournalController.monitorCashFlowStatistic(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedMonitorCashFlowStatisticApplicationService.prototype
                    .retrieveCashFlowStatistic,
            ).toHaveBeenCalledWith(requestYear);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response monitor cash flow statistic on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                query: Object.assign({}, { tahun: {} }),
            });

            await financialJournalController.monitorCashFlowStatistic(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedMonitorCashFlowStatisticApplicationService.prototype
                    .retrieveCashFlowStatistic,
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

    let mockedMonitorBalanceSheetApplicationService: jest.MockedClass<
        typeof MonitorBalanceSheetApplicationService
    >;
    describe("Monitor Balance Sheet Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                query: Object.assign({}, { tahun: requestYear }),
            });
            mockedMonitorBalanceSheetApplicationService =
                MonitorBalanceSheetApplicationService as jest.MockedClass<
                    typeof MonitorBalanceSheetApplicationService
                >;
            mockedMonitorBalanceSheetApplicationService.prototype.retrieveBalanceSheetData =
                mockData.executeBalanceSheet;
        });

        it("should success return response monitor balance sheet", async () => {
            await financialJournalController.monitorBalanceSheet(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedMonitorBalanceSheetApplicationService.prototype
                    .retrieveBalanceSheetData,
            ).toHaveBeenCalledWith(requestYear);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.monitorBalanceSheet,
            );
        });

        it("should error return response monitor balance sheet", async () => {
            mockedMonitorBalanceSheetApplicationService.prototype.retrieveBalanceSheetData =
                mockData.executeError;

            await financialJournalController.monitorBalanceSheet(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedMonitorBalanceSheetApplicationService.prototype
                    .retrieveBalanceSheetData,
            ).toHaveBeenCalledWith(requestYear);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response monitor balance sheet on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                query: Object.assign({}, { tahun: {} }),
            });

            await financialJournalController.monitorBalanceSheet(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedMonitorBalanceSheetApplicationService.prototype
                    .retrieveBalanceSheetData,
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
