import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../../shared/abstract";
import { EventBus } from "../../../../../shared/util";
import {
    IMonitorCashFlowStatisticApplicationService,
    MonitorCashFlowStatisticApplicationService,
} from "../../application/query";
import { CashFlowStatisticEntity } from "../../domain/entity";
import { FinancialStatictic } from "../../domain/value_object";

describe("Testing Monitor Cash Flow Statistic Service", () => {
    const monthlyFundApplicationDataResultSubscribe = [
        {
            bulan: 8,
            total: 12000000,
        },
        {
            bulan: 10,
            total: 10000000,
        },
        {
            bulan: 11,
            total: 11000000,
        },
    ];

    const monthlyFundUsageDataResultSubscribe = [
        {
            bulan: 8,
            total: 10000000,
        },
        {
            bulan: 10,
            total: 5000000,
        },
        {
            bulan: 11,
            total: 14000000,
        },
    ];

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

    const [
        monthlyFundApplicationsRequestedEventName,
        monthlyFundApplicationsRetrievedEventName,
        monthlyFundUsagesRequestedEventName,
        monthlyFundUsagesRetrievedEventName,
    ] = [
        "MonthlyFundApplicationsRequested",
        "MonthlyFundApplicationsRetrieved",
        "MonthlyFundUsagesRequested",
        "MonthlyFundUsagesRetrieved",
    ];

    const mockData = {
        json: jest.fn(),
        removeSpecificListener: jest.fn(),
        publish: jest.fn(),
        subscribe: jest.fn().mockImplementation((eventName, callback) => {
            if (eventName === monthlyFundApplicationsRetrievedEventName) {
                callback({
                    data: monthlyFundApplicationDataResultSubscribe,
                    eventName: monthlyFundApplicationsRetrievedEventName,
                });
            } else if (eventName === monthlyFundUsagesRetrievedEventName) {
                callback({
                    data: monthlyFundUsageDataResultSubscribe,
                    eventName: monthlyFundUsagesRetrievedEventName,
                });
            }
        }),
        subscribeErrorFundUsage: jest
            .fn()
            .mockImplementation((eventName, callback) => {
                if (eventName === monthlyFundApplicationsRetrievedEventName) {
                    callback({
                        data: monthlyFundApplicationDataResultSubscribe,
                        eventName: monthlyFundApplicationsRetrievedEventName,
                    });
                } else if (eventName === monthlyFundUsagesRetrievedEventName) {
                    callback({
                        data: {
                            status: "error",
                            code: StatusCodes.INTERNAL_SERVER_ERROR,
                            message: "Internal Server Error",
                        },
                        eventName: monthlyFundUsagesRetrievedEventName,
                    });
                }
            }),
        subscribeErrorFundApplication: jest
            .fn()
            .mockImplementation((eventName, callback) => {
                if (eventName === monthlyFundApplicationsRetrievedEventName) {
                    callback({
                        data: {
                            status: "error",
                            code: StatusCodes.INTERNAL_SERVER_ERROR,
                            message: "Internal Server Error",
                        },
                        eventName: monthlyFundUsagesRetrievedEventName,
                    });
                }
            }),
    };

    let eventBus: EventBus;
    let monitorCashFlowStatisticApplicationService: IMonitorCashFlowStatisticApplicationService;

    beforeEach(() => {
        jest.clearAllMocks();
        eventBus = new EventBus();
        eventBus.removeSpecificListener = mockData.removeSpecificListener;
        eventBus.publish = mockData.publish;
        eventBus.subscribe = mockData.subscribe;
        monitorCashFlowStatisticApplicationService =
            new MonitorCashFlowStatisticApplicationService(eventBus);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const year = 2023;
    const requestEvent = {
        data: { tahun: year },
    };
    describe("Monitor Cash Flow Statistic Service", () => {
        it("should success retrieve cash flow statistic data", async () => {
            const cashFlowStatistic =
                await monitorCashFlowStatisticApplicationService.retrieveCashFlowStatistic(
                    year,
                );

            expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                1,
                monthlyFundApplicationsRetrievedEventName,
            );
            expect(eventBus.publish).toHaveBeenNthCalledWith(
                1,
                monthlyFundApplicationsRequestedEventName,
                {
                    ...requestEvent,
                    eventName: monthlyFundApplicationsRequestedEventName,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                1,
                monthlyFundApplicationsRetrievedEventName,
                expect.any(Function),
            );
            expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                2,
                monthlyFundUsagesRetrievedEventName,
            );
            expect(eventBus.publish).toHaveBeenNthCalledWith(
                2,
                monthlyFundUsagesRequestedEventName,
                {
                    ...requestEvent,
                    eventName: monthlyFundUsagesRequestedEventName,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                2,
                monthlyFundUsagesRetrievedEventName,
                expect.any(Function),
            );
            expect(cashFlowStatistic).toEqual(
                expect.objectContaining({
                    ...cashFlowStatisticResult,
                    id: expect.anything(),
                }),
            );
        });

        it("should error retrieve cash flow statistic data on subscribe event fund usage", async () => {
            eventBus.subscribe = mockData.subscribeErrorFundUsage;

            try {
                await monitorCashFlowStatisticApplicationService.retrieveCashFlowStatistic(
                    year,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    1,
                    monthlyFundApplicationsRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    1,
                    monthlyFundApplicationsRequestedEventName,
                    {
                        ...requestEvent,
                        eventName: monthlyFundApplicationsRequestedEventName,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    1,
                    monthlyFundApplicationsRetrievedEventName,
                    expect.any(Function),
                );
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    2,
                    monthlyFundUsagesRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    2,
                    monthlyFundUsagesRequestedEventName,
                    {
                        ...requestEvent,
                        eventName: monthlyFundUsagesRequestedEventName,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    2,
                    monthlyFundUsagesRetrievedEventName,
                    expect.any(Function),
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error retrieve cash flow statistic data on subscribe event fund application", async () => {
            eventBus.subscribe = mockData.subscribeErrorFundApplication;

            try {
                await monitorCashFlowStatisticApplicationService.retrieveCashFlowStatistic(
                    year,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    1,
                    monthlyFundApplicationsRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    1,
                    monthlyFundApplicationsRequestedEventName,
                    {
                        ...requestEvent,
                        eventName: monthlyFundApplicationsRequestedEventName,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    1,
                    monthlyFundApplicationsRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    eventBus.removeSpecificListener,
                ).not.toHaveBeenNthCalledWith(
                    2,
                    monthlyFundUsagesRetrievedEventName,
                );
                expect(eventBus.publish).not.toHaveBeenNthCalledWith(
                    2,
                    monthlyFundUsagesRequestedEventName,
                    {
                        ...requestEvent,
                        eventName: monthlyFundUsagesRequestedEventName,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).not.toHaveBeenNthCalledWith(
                    2,
                    monthlyFundUsagesRetrievedEventName,
                    expect.any(Function),
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
