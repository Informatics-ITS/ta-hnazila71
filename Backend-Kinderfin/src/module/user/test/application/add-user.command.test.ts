import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import {
    AddUserCommand,
    AddUserCommandHandler,
} from "../../application/command";
import { UserEntity, UserProps } from "../../domain/entity";
import { MasterDataRequestedEvent } from "../../domain/event";
import { IUserRepository } from "../../domain/repository";
import { IPasswordService, UserService } from "../../domain/service";
import { BankAccount } from "../../domain/value_object";
import { PasswordService } from "../../infrastructure/service";
import { UserRepository } from "../../infrastructure/storage/repository";

describe("Testing Add User Command", () => {
    const [nama_bank, pemilik_rekening, nomor_rekening] = [
        "Bank A",
        "User A",
        "135349212211",
    ];

    const masterDatas = [
        {
            id: "d79fabb5-e776-4725-8ca5-a898e6c29511",
            tipe: "Bank",
            nilai: "Bank A",
            aturan: "12 digit",
            deskripsi: "Status untuk rekening Bank A",
        },
        {
            id: "4fca6786-461f-40b8-8a32-6062ffbf6565",
            tipe: "Bank",
            nilai: "Bank B",
            aturan: "10 digit",
            deskripsi: "Status untuk rekening Bank B",
        },
    ];

    const userDataRequested: AddUserCommand = {
        nip: "012345678901234567",
        nama_lengkap: "Test User",
        email: "testuser@gmail.com",
        password: "Userpass1!",
        nama_bank: nama_bank,
        pemilik_rekening: pemilik_rekening,
        nomor_rekening: nomor_rekening,
    };

    const userDataResult = new UserEntity<UserProps>({
        nip: "012345678901234567",
        nama_lengkap: "Test User",
        email: "testuser@gmail.com",
    } as UserProps);
    userDataResult.setAkunBank(
        new BankAccount(nama_bank, pemilik_rekening, nomor_rekening),
    );

    const [
        masterDataRequestedEventName,
        masterDataRetrievedEventName,
        masterDataType,
    ] = ["MasterDataRequested", "MasterDataRetrieved", "Bank"];

    const masterDataRequestedEvent = new MasterDataRequestedEvent(
        { tipe: masterDataType },
        masterDataRequestedEventName,
    );

    const mockData = {
        verifyBankNameMasterData: jest
            .fn()
            .mockReturnValue({ constraint: "12 digit", err: null }),
        verifyBankNameMasterDataError: jest.fn().mockReturnValue({
            constraint: undefined,
            err: Error("Nama bank tidak terdaftar"),
        }),
        validateAccountNumberDigit: jest.fn().mockReturnValue(null),
        validateAccountNumberDigitError: jest
            .fn()
            .mockReturnValue(
                Error("Input nomor rekening harus terdiri dari 12 digit"),
            ),
        userEmailExist: jest
            .fn()
            .mockReturnValue(Error("Email telah terdaftar")),
        userEmailNotExist: jest.fn().mockReturnValue(null),
        addUser: jest.fn(),
        addUserError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        removeSpecificListener: jest.fn(),
        publish: jest.fn(),
        subscribe: jest.fn().mockImplementation((eventName, callback) => {
            if (eventName === masterDataRetrievedEventName) {
                callback({
                    data: masterDatas,
                    eventName: masterDataRetrievedEventName,
                });
            }
        }),
        subscribeError: jest.fn().mockImplementation((eventName, callback) => {
            if (eventName === masterDataRetrievedEventName) {
                callback({
                    data: {
                        status: "error",
                        code: StatusCodes.INTERNAL_SERVER_ERROR,
                        message: "Internal Server Error",
                    },
                    eventName: masterDataRetrievedEventName,
                });
            }
        }),
    };

    jest.mock("../../domain/entity");
    jest.mock("../../domain/value_object");
    let mockedDatabase: Sequelize;
    let mockedUserEntity: jest.MockedClass<typeof UserEntity>;
    let mockedBankAccount: jest.MockedClass<typeof BankAccount>;
    let userRepository: IUserRepository;
    let passwordService: IPasswordService;
    let eventBus: EventBus;
    let addUserCommandHandler: ICommandHandler<AddUserCommand, void>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedUserEntity = UserEntity as jest.MockedClass<typeof UserEntity>;
        mockedUserEntity.prototype.verifyBankNameMasterData =
            mockData.verifyBankNameMasterData;
        mockedBankAccount = BankAccount as jest.MockedClass<typeof BankAccount>;
        mockedBankAccount.prototype.validateAccountNumberDigit =
            mockData.validateAccountNumberDigit;
        userRepository = new UserRepository(mockedDatabase);
        userRepository = {
            isUserEmailExist: mockData.userEmailNotExist,
            addUser: mockData.addUser,
        } as any;
        passwordService = new PasswordService();
        eventBus = new EventBus();
        eventBus.removeSpecificListener = mockData.removeSpecificListener;
        eventBus.publish = mockData.publish;
        eventBus.subscribe = mockData.subscribe;
        addUserCommandHandler = new AddUserCommandHandler(
            userRepository,
            passwordService,
            eventBus,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    jest.mock("../../domain/service");
    let mockedUserService: jest.MockedClass<typeof UserService>;
    let [email, constraint] = ["testuser@gmail.com", "12 digit"];
    describe("Execute Add User", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockedUserService = UserService as jest.MockedClass<
                typeof UserService
            >;
            mockedUserService.prototype.validateUniqueUser =
                mockData.userEmailNotExist;
        });
        it("should success execute add user", async () => {
            await addUserCommandHandler.execute(userDataRequested);

            expect(
                mockedUserService.prototype.validateUniqueUser,
            ).toHaveBeenCalledWith(email, userRepository);
            expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                masterDataRetrievedEventName,
            );
            expect(eventBus.publish).toHaveBeenCalledWith(
                masterDataRequestedEventName,
                {
                    ...masterDataRequestedEvent,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenCalledWith(
                masterDataRetrievedEventName,
                expect.any(Function),
            );
            expect(
                mockedUserEntity.prototype.verifyBankNameMasterData,
            ).toHaveBeenCalledWith(masterDatas);
            expect(
                mockedBankAccount.prototype.validateAccountNumberDigit,
            ).toHaveBeenCalledWith(constraint);
            expect(userRepository.addUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...userDataResult,
                    id: expect.anything(),
                    password: expect.any(String),
                }),
            );
        });

        it("should error execute add user", async () => {
            userRepository.addUser = mockData.addUserError;

            try {
                await addUserCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedUserService.prototype.validateUniqueUser,
                ).toHaveBeenCalledWith(email, userRepository);
                expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenCalledWith(
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedUserEntity.prototype.verifyBankNameMasterData,
                ).toHaveBeenCalledWith(masterDatas);
                expect(
                    mockedBankAccount.prototype.validateAccountNumberDigit,
                ).toHaveBeenCalledWith(constraint);
                expect(userRepository.addUser).toHaveBeenCalledWith(
                    expect.objectContaining({
                        ...userDataResult,
                        id: expect.anything(),
                        password: expect.any(String),
                    }),
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute add user on invalid accout numnber digit", async () => {
            mockedBankAccount.prototype.validateAccountNumberDigit =
                mockData.validateAccountNumberDigitError;

            try {
                await addUserCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedUserService.prototype.validateUniqueUser,
                ).toHaveBeenCalledWith(email, userRepository);
                expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenCalledWith(
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedUserEntity.prototype.verifyBankNameMasterData,
                ).toHaveBeenCalledWith(masterDatas);
                expect(
                    mockedBankAccount.prototype.validateAccountNumberDigit,
                ).toHaveBeenCalledWith(constraint);
                expect(userRepository.addUser).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input nomor rekening harus terdiri dari 12 digit",
                );
            }
        });

        it("should error execute add user on bank not found", async () => {
            mockedUserEntity.prototype.verifyBankNameMasterData =
                mockData.verifyBankNameMasterDataError;

            try {
                await addUserCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedUserService.prototype.validateUniqueUser,
                ).toHaveBeenCalledWith(email, userRepository);
                expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenCalledWith(
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedUserEntity.prototype.verifyBankNameMasterData,
                ).toHaveBeenCalledWith(masterDatas);
                expect(
                    mockedBankAccount.prototype.validateAccountNumberDigit,
                ).not.toHaveBeenCalled();
                expect(userRepository.addUser).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual("Nama bank tidak terdaftar");
            }
        });

        it("should error execute add user on subscribe event", async () => {
            eventBus.subscribe = mockData.subscribeError;

            try {
                await addUserCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedUserService.prototype.validateUniqueUser,
                ).toHaveBeenCalledWith(email, userRepository);
                expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenCalledWith(
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedUserEntity.prototype.verifyBankNameMasterData,
                ).not.toHaveBeenCalled();
                expect(
                    mockedBankAccount.prototype.validateAccountNumberDigit,
                ).not.toHaveBeenCalled();
                expect(userRepository.addUser).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute add user on email already registered", async () => {
            mockedUserService.prototype.validateUniqueUser =
                mockData.userEmailExist;

            try {
                await addUserCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedUserService.prototype.validateUniqueUser,
                ).toHaveBeenCalledWith(email, userRepository);
                expect(eventBus.removeSpecificListener).not.toHaveBeenCalled();
                expect(eventBus.publish).not.toHaveBeenCalled();
                expect(eventBus.subscribe).not.toHaveBeenCalled();
                expect(
                    mockedUserEntity.prototype.verifyBankNameMasterData,
                ).not.toHaveBeenCalled();
                expect(
                    mockedBankAccount.prototype.validateAccountNumberDigit,
                ).not.toHaveBeenCalled();
                expect(userRepository.addUser).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual("Email telah terdaftar");
            }
        });
    });
});
