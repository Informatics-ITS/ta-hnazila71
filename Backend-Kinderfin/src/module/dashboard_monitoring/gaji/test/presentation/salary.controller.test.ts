import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as httpMocks from "node-mocks-http";
import {
    ApplicationError,
    DefaultMessage,
} from "../../../../../shared/abstract";
import { EventBus } from "../../../../../shared/util";
import { MonitorSalaryApplicationService } from "../../application/query";
import { SalaryHistoryEntity, SalaryHistoryProps } from "../../domain/entity";
import { SalaryController } from "../../presentation/controller";
import { SalaryStatus } from "../../domain/enum";

describe("Testing Salary Controller", () => {
    const salaryDataResult = [
        new SalaryHistoryEntity<SalaryHistoryProps>({
            nama_lengkap: "Test User A",
            tanggal_pembayaran: new Date("2023-10-13"),
            nominal: 1800000,
            status_pembayaran: SalaryStatus.PAID,
        }),
        new SalaryHistoryEntity<SalaryHistoryProps>({
            nama_lengkap: "Test User B",
            tanggal_pembayaran: new Date("2023-10-14"),
            nominal: 2000000,
            status_pembayaran: SalaryStatus.PAID,
        }),
    ];
    const sentMessage = {
        success: {
            monitor: {
                status: "success",
                message: DefaultMessage.SUC_AGET,
                data: salaryDataResult,
            },
        },
        failed: {
            status: "failed",
            error: "Internal Server Error",
        },
    };

    const mockData = {
        execute: jest.fn().mockReturnValue(salaryDataResult),
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
    let salaryController: SalaryController;

    beforeEach(() => {
        jest.clearAllMocks();
        eventBus = new EventBus();
        salaryController = new SalaryController(eventBus);
        mockResponse = httpMocks.createResponse();
        mockResponse.json = mockData.json;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const [userId, role] = [
        "5a53d571-f85b-4373-8935-bc7eefab74f6",
        "Administrator Keuangan",
    ];
    let mockedMonitorSalaryApplicationService: jest.MockedClass<
        typeof MonitorSalaryApplicationService
    >;
    describe("Monitor All Salaries Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest();
            mockResponse.locals.id_user = userId;
            mockResponse.locals.role = role;
            mockedMonitorSalaryApplicationService =
                MonitorSalaryApplicationService as jest.MockedClass<
                    typeof MonitorSalaryApplicationService
                >;
            mockedMonitorSalaryApplicationService.prototype.retrieveSalaryData =
                mockData.execute;
        });

        it("should success return response monitor all salaries", async () => {
            await salaryController.monitorAllSalaries(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedMonitorSalaryApplicationService.prototype
                    .retrieveSalaryData,
            ).toHaveBeenCalledWith(userId, role);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.monitor,
            );
        });

        it("should error return response monitor all salaries", async () => {
            mockedMonitorSalaryApplicationService.prototype.retrieveSalaryData =
                mockData.executeError;

            await salaryController.monitorAllSalaries(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedMonitorSalaryApplicationService.prototype
                    .retrieveSalaryData,
            ).toHaveBeenCalledWith(userId, role);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response monitor all salaries on validate request", async () => {
            mockResponse.locals.role = 2;

            await salaryController.monitorAllSalaries(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedMonitorSalaryApplicationService.prototype
                    .retrieveSalaryData,
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
