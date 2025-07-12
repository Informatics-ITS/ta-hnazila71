import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../../shared/abstract";
import { EventBus } from "../../../../../shared/util";
import {
    IMonitorSalaryApplicationService,
    MonitorSalaryApplicationService,
} from "../../application/query";
import { SalaryHistoryEntity, SalaryHistoryProps } from "../../domain/entity";
import { SalaryStatus } from "../../domain/enum";
import { SalaryFilterService } from "../../domain/service";

describe("Testing Monitor Salary Service", () => {
    const salaryDataResultSubscribe = [
        {
            id: "78365f59-680e-43ec-a793-4f0cbc7801ee",
            nama_lengkap: "Test User A",
            tanggal_pembayaran: new Date("2023-10-13"),
            nominal: 1800000,
            status_pembayaran: SalaryStatus.PAID,
        },
        {
            id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
            nama_lengkap: "Test User B",
            tanggal_pembayaran: new Date("2023-10-14"),
            nominal: 2000000,
            status_pembayaran: SalaryStatus.PAID,
        },
    ];

    const salaryDataUnpaidResultSubscribe = [
        {
            id: "78365f59-680e-43ec-a793-4f0cbc7801ee",
            nama_lengkap: "Test User A",
            tanggal_pembayaran: new Date("2023-10-13"),
            nominal: 1800000,
            status_pembayaran: SalaryStatus.PAID,
        },
        {
            id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
            nama_lengkap: "Test User B",
            tanggal_pembayaran: new Date("2023-10-14"),
            nominal: 2000000,
            status_pembayaran: SalaryStatus.PENDING,
        },
    ];

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
    ].map(({ id, ...rest }) => rest);

    const salaryDataUnpaidResult = [
        new SalaryHistoryEntity<SalaryHistoryProps>({
            nama_lengkap: "Test User A",
            tanggal_pembayaran: new Date("2023-10-13"),
            nominal: 1800000,
            status_pembayaran: SalaryStatus.PAID,
        }),
    ].map(({ id, ...rest }) => rest);

    const [salaryDataRequestedEventName, salaryDataRetrievedEventName] = [
        "SalaryDataRequested",
        "SalaryDataRetrieved",
    ];

    const mockData = {
        salaryPaidFiltered: jest.fn().mockReturnValue(salaryDataResult),
        salaryUnpaidFiltered: jest.fn().mockReturnValue(salaryDataUnpaidResult),
        json: jest.fn(),
        removeSpecificListener: jest.fn(),
        publish: jest.fn(),
        subscribe: jest.fn().mockImplementation((eventName, callback) => {
            if (eventName === salaryDataRetrievedEventName) {
                callback({
                    data: salaryDataResultSubscribe,
                    eventName: salaryDataRetrievedEventName,
                });
            }
        }),
        subscribeUnpaid: jest.fn().mockImplementation((eventName, callback) => {
            if (eventName === salaryDataRetrievedEventName) {
                callback({
                    data: salaryDataUnpaidResultSubscribe,
                    eventName: salaryDataRetrievedEventName,
                });
            }
        }),
        subscribeError: jest.fn().mockImplementation((eventName, callback) => {
            if (eventName === salaryDataRetrievedEventName) {
                callback({
                    data: {
                        status: "error",
                        code: StatusCodes.INTERNAL_SERVER_ERROR,
                        message: "Internal Server Error",
                    },
                    eventName: salaryDataRetrievedEventName,
                });
            }
        }),
    };

    let eventBus: EventBus;
    let monitorSalaryApplicationService: IMonitorSalaryApplicationService;

    beforeEach(() => {
        jest.clearAllMocks();
        eventBus = new EventBus();
        eventBus.removeSpecificListener = mockData.removeSpecificListener;
        eventBus.publish = mockData.publish;
        eventBus.subscribe = mockData.subscribe;
        monitorSalaryApplicationService = new MonitorSalaryApplicationService(
            eventBus,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    jest.mock("../../domain/service");
    let mockedSalaryFilterService: jest.MockedClass<typeof SalaryFilterService>;
    const [userId, role] = [
        "5a53d571-f85b-4373-8935-bc7eefab74f6",
        "Administrator Keuangan",
    ];
    const requestEvent = {
        data: { id_user: userId, role: role },
    };
    describe("Monitor Salary Service", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockedSalaryFilterService = SalaryFilterService as jest.MockedClass<
                typeof SalaryFilterService
            >;
            mockedSalaryFilterService.prototype.filterSalaryPaid =
                mockData.salaryPaidFiltered;
        });
        it("should success retrieve salary data", async () => {
            const salaries =
                await monitorSalaryApplicationService.retrieveSalaryData(
                    userId,
                    role,
                );

            expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                salaryDataRetrievedEventName,
            );
            expect(eventBus.publish).toHaveBeenCalledWith(
                salaryDataRequestedEventName,
                {
                    ...requestEvent,
                    eventName: salaryDataRequestedEventName,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenCalledWith(
                salaryDataRetrievedEventName,
                expect.any(Function),
            );
            expect(
                mockedSalaryFilterService.prototype.filterSalaryPaid,
            ).toHaveBeenCalledWith(salaryDataResultSubscribe);
            expect(salaries.map(({ id, ...rest }) => rest)).toEqual(
                salaryDataResult,
            );
        });

        it("should success retrieve salary data filtered unpaid", async () => {
            eventBus.subscribe = mockData.subscribeUnpaid;
            mockedSalaryFilterService.prototype.filterSalaryPaid =
                mockData.salaryUnpaidFiltered;

            const salaries =
                await monitorSalaryApplicationService.retrieveSalaryData(
                    userId,
                    role,
                );

            expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                salaryDataRetrievedEventName,
            );
            expect(eventBus.publish).toHaveBeenCalledWith(
                salaryDataRequestedEventName,
                {
                    ...requestEvent,
                    eventName: salaryDataRequestedEventName,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenCalledWith(
                salaryDataRetrievedEventName,
                expect.any(Function),
            );
            expect(
                mockedSalaryFilterService.prototype.filterSalaryPaid,
            ).toHaveBeenCalledWith(salaryDataUnpaidResultSubscribe);
            expect(salaries.map(({ id, ...rest }) => rest)).toEqual(
                salaryDataUnpaidResult,
            );
        });

        it("should error return response monitor all salaries on subscribe event", async () => {
            eventBus.subscribe = mockData.subscribeError;

            try {
                await monitorSalaryApplicationService.retrieveSalaryData(
                    userId,
                    role,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                    salaryDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    salaryDataRequestedEventName,
                    {
                        ...requestEvent,
                        eventName: salaryDataRequestedEventName,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenCalledWith(
                    salaryDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedSalaryFilterService.prototype.filterSalaryPaid,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
