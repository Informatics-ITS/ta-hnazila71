import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import {
    UpdateSalaryCommand,
    UpdateSalaryCommandHandler,
} from "../../application/command";
import { SalaryEntity, SalaryProps, UserProps } from "../../domain/entity";
import { SalaryStatus, UserRole } from "../../domain/enum";
import {
    EmployeeSalaryUpdatedEvent,
    UserDataRequestedEvent,
} from "../../domain/event";
import { ISalaryRepository } from "../../domain/repository";
import { SalaryRepository } from "../../infrastructure/storage/repository";

describe("Testing Update Salary Command", () => {
    const userData: UserProps = {
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
    };

    const oldSalaryData: SalaryProps = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        nama_lengkap: "Test User B",
        tanggal_pembayaran: new Date("2023-10-12"),
        nominal: 1500000,
        user_id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        status_pembayaran: SalaryStatus.PAID,
    };

    const salaryDataRequested: UpdateSalaryCommand = {
        nama_lengkap: "Test User",
        tanggal_pembayaran: new Date("2023-10-14"),
        nominal: 2000000,
        nama_lengkap_lama: "Test User B",
        tanggal_pembayaran_lama: new Date("2023-10-12"),
    };

    const salaryDataResult = new SalaryEntity<SalaryProps>({
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        nama_lengkap: "Test User",
        tanggal_pembayaran: new Date("2023-10-14"),
        nominal: 2000000,
        user_id: "3679285c-707c-42ed-9c6e-9984825b22fd",
    } as SalaryProps);

    const [
        requestUserEventName,
        userDataRetrievedEventName,
        employeeSalaryUpdatedEventName,
    ] = [
            "UserDataRequestedByFullName",
            "UserDataByFullNameRetrieved",
            "EmployeeSalaryUpdated",
        ];

    const userDataRequestedEvent = new UserDataRequestedEvent(
        salaryDataRequested,
        requestUserEventName,
    );

    const employeeSalaryUpdatedSuccessEvent = new EmployeeSalaryUpdatedEvent(
        "success",
        employeeSalaryUpdatedEventName,
    );

    const employeeSalaryUpdatedFailedEvent = {
        data: {
            status: "error",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
        },
        employeeSalaryUpdatedEventName,
    };

    const mockData = {
        salaryDataExist: jest.fn().mockReturnValue(oldSalaryData),
        salaryDataNotExist: jest.fn().mockReturnValue(null),
        updateSalary: jest.fn(),
        updateSalaryError: jest
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
    let updateSalaryCommandHandler: ICommandHandler<UpdateSalaryCommand, void>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        salaryRepository = new SalaryRepository(mockedDatabase);
        salaryRepository = {
            isSalaryDataExist: mockData.salaryDataExist,
            updateSalary: mockData.updateSalary,
        } as any;
        eventBus = new EventBus();
        eventBus.removeSpecificListener = mockData.removeSpecificListener;
        eventBus.publish = mockData.publish;
        eventBus.subscribe = mockData.subscribe;
        updateSalaryCommandHandler = new UpdateSalaryCommandHandler(
            salaryRepository,
            eventBus,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const [nama_lengkap_lama, tanggal_pembayaran_lama, userId] = [
        "Test User B",
        new Date("2023-10-12"),
        "5a53d571-f85b-4373-8935-bc7eefab74f6",
    ];
    describe("Execute Update Salary", () => {
        it("should success execute update salary", async () => {
            await updateSalaryCommandHandler.execute(salaryDataRequested);
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
            expect(salaryRepository.isSalaryDataExist).toHaveBeenCalledWith(
                nama_lengkap_lama,
                tanggal_pembayaran_lama,
            );
            expect(salaryRepository.updateSalary).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...salaryDataResult,
                    id: expect.anything(),
                }),
                oldSalaryData,
            );
            expect(eventBus.publish).toHaveBeenNthCalledWith(
                2,
                employeeSalaryUpdatedEventName,
                {
                    ...employeeSalaryUpdatedSuccessEvent,
                    eventOccurred: expect.anything(),
                },
            );
        });

        it("should error execute update salary on update salary", async () => {
            salaryRepository.updateSalary = mockData.updateSalaryError;

            try {
                await updateSalaryCommandHandler.execute(salaryDataRequested);
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
                expect(salaryRepository.isSalaryDataExist).toHaveBeenCalledWith(
                    nama_lengkap_lama,
                    tanggal_pembayaran_lama,
                );
                expect(salaryRepository.updateSalary).toHaveBeenCalledWith(
                    expect.objectContaining({
                        ...salaryDataResult,
                        id: expect.anything(),
                    }),
                    oldSalaryData,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    2,
                    employeeSalaryUpdatedEventName,
                    {
                        ...employeeSalaryUpdatedFailedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update salary on subscribe event", async () => {
            eventBus.subscribe = mockData.subscribeError;

            try {
                await updateSalaryCommandHandler.execute(salaryDataRequested);
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
                expect(
                    salaryRepository.isSalaryDataExist,
                ).not.toHaveBeenCalled();
                expect(salaryRepository.updateSalary).not.toHaveBeenCalled();
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    2,
                    employeeSalaryUpdatedEventName,
                    {
                        ...employeeSalaryUpdatedFailedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
