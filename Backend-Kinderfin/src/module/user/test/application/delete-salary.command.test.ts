import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import {
    ApplicationError,
    ICommandHandler,
} from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import {
    DeleteSalaryCommand,
    DeleteSalaryCommandHandler,
} from "../../application/command";
import { SalaryProps } from "../../domain/entity";
import { SalaryStatus } from "../../domain/enum";
import { EmployeeSalaryDeletedEvent } from "../../domain/event";
import { ISalaryRepository } from "../../domain/repository";
import { SalaryRepository } from "../../infrastructure/storage/repository";

describe("Testing Delete Salary Command", () => {
    const oldSalaryData: SalaryProps = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        nama_lengkap: "Test User",
        tanggal_pembayaran: new Date("2023-10-12"),
        nominal: 1500000,
        user_id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        status_pembayaran: SalaryStatus.PAID,
    };

    const salaryDataRequested: DeleteSalaryCommand = {
        nama_lengkap: "Test User",
        tanggal_pembayaran: new Date("2023-10-12"),
    };

    const employeeSalaryDeletedEventName = "EmployeeSalaryDeleted";

    const employeeSalaryDeletedSuccessEvent = new EmployeeSalaryDeletedEvent(
        "success",
        employeeSalaryDeletedEventName,
    );

    const employeeSalaryDeletedFailedEvent = {
        data: {
            status: "error",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
        },
        employeeSalaryDeletedEventName,
    };

    const mockData = {
        salaryDataExist: jest.fn().mockReturnValue(oldSalaryData),
        salaryDataNotExist: jest.fn().mockReturnValue(null),
        deleteSalary: jest.fn(),
        deleteSalaryError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        publish: jest.fn(),
    };

    let mockedDatabase: Sequelize;
    let salaryRepository: ISalaryRepository;
    let eventBus: EventBus;
    let deleteSalaryCommandHandler: ICommandHandler<DeleteSalaryCommand, void>;

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
            deleteSalary: mockData.deleteSalary,
        } as any;
        eventBus = new EventBus();
        eventBus.publish = mockData.publish;
        deleteSalaryCommandHandler = new DeleteSalaryCommandHandler(
            salaryRepository,
            eventBus,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const [fullName, paymentDate] = ["Test User", new Date("2023-10-12")];
    describe("Execute Delete Salary", () => {
        it("should success execute delete salary", async () => {
            await deleteSalaryCommandHandler.execute(salaryDataRequested);

            expect(salaryRepository.isSalaryDataExist).toHaveBeenCalledWith(
                fullName,
                paymentDate,
            );
            expect(salaryRepository.deleteSalary).toHaveBeenCalledWith(
                fullName,
                paymentDate,
            );
            expect(eventBus.publish).toHaveBeenCalledWith(
                employeeSalaryDeletedEventName,
                {
                    ...employeeSalaryDeletedSuccessEvent,
                    eventOccurred: expect.anything(),
                },
            );
        });

        it("should error execute delete salary on delete salary", async () => {
            salaryRepository.deleteSalary = mockData.deleteSalaryError;

            try {
                await deleteSalaryCommandHandler.execute(salaryDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(salaryRepository.isSalaryDataExist).toHaveBeenCalledWith(
                    fullName,
                    paymentDate,
                );
                expect(salaryRepository.deleteSalary).toHaveBeenCalledWith(
                    fullName,
                    paymentDate,
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    employeeSalaryDeletedEventName,
                    {
                        ...employeeSalaryDeletedFailedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute delete salary on empty salary data", async () => {
            salaryRepository.isSalaryDataExist = mockData.salaryDataNotExist;

            try {
                await deleteSalaryCommandHandler.execute(salaryDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(salaryRepository.isSalaryDataExist).toHaveBeenCalledWith(
                    fullName,
                    paymentDate,
                );
                expect(salaryRepository.deleteSalary).not.toHaveBeenCalled();
                expect(eventBus.publish).toHaveBeenCalledWith(
                    employeeSalaryDeletedEventName,
                    {
                        ...employeeSalaryDeletedFailedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.NOT_FOUND);
                expect(appErr.message).toEqual("Data gaji tidak ditemukan");
            }
        });
    });
});
