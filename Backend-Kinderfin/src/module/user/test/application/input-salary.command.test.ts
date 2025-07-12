import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import {
    ApplicationError,
    ICommandHandler,
} from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import {
    InputSalaryCommand,
    InputSalaryCommandHandler,
} from "../../application/command";
import { SalaryEntity, SalaryProps, UserProps } from "../../domain/entity";
import { UserRole } from "../../domain/enum";
import {
    EmployeeSalaryPaidEvent, UserDataRequestedEvent
} from "../../domain/event";
import { ISalaryRepository } from "../../domain/repository";
import { SalaryRepository } from "../../infrastructure/storage/repository";

describe("Testing Input Salary Command", () => {
    const salaryDataRequested: InputSalaryCommand = {
        nama_lengkap: "Test User",
        tanggal_pembayaran: new Date("2023-10-14"),
        nominal: 2000000,
    };

    const salaryDataResult = new SalaryEntity<SalaryProps>({
        nama_lengkap: "Test User",
        tanggal_pembayaran: new Date("2023-10-14"),
        nominal: 2000000,
        user_id: "3679285c-707c-42ed-9c6e-9984825b22fd",
    } as SalaryProps);

    const [
        requestUserEventName,
        userDataRetrievedEventName,
        employeeSalaryPaidEventName,
    ] = [
            "UserDataRequestedByFullName",
            "UserDataByFullNameRetrieved",
            "EmployeeSalaryPaid",
        ];

    const userDataRequestedEvent = new UserDataRequestedEvent(
        salaryDataRequested,
        requestUserEventName,
    );

    const employeeSalaryPaidSuccessEvent = new EmployeeSalaryPaidEvent(
        "success",
        employeeSalaryPaidEventName,
    );

    const employeeSalaryPaidFailedEvent = {
        data: {
            status: "error",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
        },
        employeeSalaryPaidEventName,
    };

    const mockData = {
        addSalary: jest.fn(),
        addSalaryError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        removeSpecificListener: jest.fn(),
        publish: jest.fn(),
        subscribe: jest.fn().mockImplementationOnce((eventName, callback) => {
            if (eventName === userDataRetrievedEventName) {
                callback({
                    data: {
                        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
                        nip: "012345678901234567",
                        nama_lengkap: "Test User",
                        email: "testuser@gmail.com",
                        password:
                            "$2b$10$t7oxiwchWGHa/B9w0AzrYO2WH2rQbA86YSuQjSTmwIrpC/0ZXN7V2",
                        role: UserRole.FINANCE_ADMIN,
                        nama_bank: "Test Bank",
                        pemilik_rekening: "User Bank",
                        nomor_rekening: "135349212211",
                        login_at: undefined,
                    },
                    eventName: userDataRetrievedEventName,
                });
            }
        }),
        subscribeError: jest
            .fn()
            .mockImplementationOnce((eventName, callback) => {
                if (eventName === userDataRetrievedEventName) {
                    callback({
                        data: {
                            status: "error",
                            code: StatusCodes.INTERNAL_SERVER_ERROR,
                            message: "Internal Server Error",
                        },
                        eventName: userDataRetrievedEventName,
                    });
                }
            }),
    };

    let mockedDatabase: Sequelize;
    let salaryRepository: ISalaryRepository;
    let eventBus: EventBus;
    let inputSalaryCommandHandler: ICommandHandler<InputSalaryCommand, void>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        salaryRepository = new SalaryRepository(mockedDatabase);
        salaryRepository = {
            addSalary: mockData.addSalary,
        } as any;
        eventBus = new EventBus();
        eventBus.removeSpecificListener = mockData.removeSpecificListener;
        eventBus.publish = mockData.publish;
        eventBus.subscribe = mockData.subscribe;
        inputSalaryCommandHandler = new InputSalaryCommandHandler(
            salaryRepository,
            eventBus,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Execute Input Salary", () => {
        it("should success execute input salary", async () => {
            await inputSalaryCommandHandler.execute(salaryDataRequested);

            expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                userDataRetrievedEventName,
            );
            expect(eventBus.publish).toHaveBeenNthCalledWith(
                1,
                requestUserEventName,
                { ...userDataRequestedEvent, eventOccurred: expect.anything() },
            );
            expect(eventBus.subscribe).toHaveBeenCalledWith(
                userDataRetrievedEventName,
                expect.any(Function),
            );
            expect(salaryRepository.addSalary).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...salaryDataResult,
                    id: expect.anything(),
                }),
            );
            expect(eventBus.publish).toHaveBeenNthCalledWith(
                2,
                employeeSalaryPaidEventName,
                {
                    ...employeeSalaryPaidSuccessEvent,
                    eventOccurred: expect.anything(),
                },
            );
        });

        it("should error execute input salary on add salary", async () => {
            salaryRepository.addSalary = mockData.addSalaryError;

            try {
                await inputSalaryCommandHandler.execute(salaryDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                    userDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    1,
                    requestUserEventName,
                    {
                        ...userDataRequestedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenCalledWith(
                    userDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(salaryRepository.addSalary).toHaveBeenCalledWith(
                    expect.objectContaining({
                        ...salaryDataResult,
                        id: expect.anything(),
                    }),
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    2,
                    employeeSalaryPaidEventName,
                    {
                        ...employeeSalaryPaidFailedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute input salary on subscribe event", async () => {
            eventBus.subscribe = mockData.subscribeError;

            try {
                await inputSalaryCommandHandler.execute(salaryDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                    userDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    1,
                    requestUserEventName,
                    {
                        ...userDataRequestedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenCalledWith(
                    userDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(salaryRepository.addSalary).not.toHaveBeenCalled();
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    2,
                    employeeSalaryPaidEventName,
                    {
                        ...employeeSalaryPaidFailedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
