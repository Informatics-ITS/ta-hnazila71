import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import {
    UpdateUserCommand,
    UpdateUserCommandHandler,
} from "../../application/command";
import { UserEntity, UserProps } from "../../domain/entity";
import { UserRole } from "../../domain/enum";
import { MasterDataRequestedEvent } from "../../domain/event";
import { IUserRepository } from "../../domain/repository";
import { IPasswordService, UserService } from "../../domain/service";
import { BankAccount } from "../../domain/value_object";
import { PasswordService } from "../../infrastructure/service";
import { UserRepository } from "../../infrastructure/storage/repository";

describe("Testing Update User Command", () => {
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

    const userData: UserProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nip: "012345678901234567",
        nama_lengkap: "Test User",
        email: "testuser1@gmail.com",
        password:
            "$2b$10$t7oxiwchWGHa/B9w0AzrYO2WH2rQbA86YSuQjSTmwIrpC/0ZXN7V2",
        role: UserRole.FINANCE_ADMIN,
        nama_bank: nama_bank,
        pemilik_rekening: pemilik_rekening,
        nomor_rekening: nomor_rekening,
        login_at: undefined,
    };

    const userDataRequested: UpdateUserCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nip: "012345678901234567",
        nama_lengkap: "Test User",
        email: "testuser@gmail.com",
        password: "Userpass1!",
        nama_bank: nama_bank,
        nomor_rekening: nomor_rekening,
    };

    const userDataRequestedWithoutBankName: UpdateUserCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nip: "012345678901234567",
        nama_lengkap: "Test User",
        email: "testuser@gmail.com",
        password: "Userpass1!",
        pemilik_rekening: pemilik_rekening,
    };

    const userDataRequestedWithoutBankAccount: UpdateUserCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nip: "012345678901234567",
        nama_lengkap: "Test User",
        email: "testuser@gmail.com",
        password: "Userpass1!",
    };

    const userDataResult = new UserEntity<UserProps>({
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
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
        userExist: jest.fn().mockReturnValue(userData),
        userEmailExist: jest
            .fn()
            .mockReturnValue(Error("Email telah terdaftar")),
        userNotExist: jest.fn().mockReturnValue(null),
        updateUser: jest.fn(),
        updateUserError: jest
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
    let updateUserCommandHandler: ICommandHandler<UpdateUserCommand, void>;

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
            isUserIdExist: mockData.userExist,
            isUserEmailExist: mockData.userNotExist,
            updateUser: mockData.updateUser,
        } as any;
        passwordService = new PasswordService();
        eventBus = new EventBus();
        eventBus.removeSpecificListener = mockData.removeSpecificListener;
        eventBus.publish = mockData.publish;
        eventBus.subscribe = mockData.subscribe;
        updateUserCommandHandler = new UpdateUserCommandHandler(
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
    let [userId, email, constraint] = [
        "3679285c-707c-42ed-9c6e-9984825b22fd",
        "testuser@gmail.com",
        "12 digit",
    ];
    describe("Execute Update User", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockedUserService = UserService as jest.MockedClass<
                typeof UserService
            >;
            mockedUserService.prototype.validateUniqueUser =
                mockData.userNotExist;
        });
        it("should success execute update user", async () => {
            await updateUserCommandHandler.execute(userDataRequested);

            expect(userRepository.isUserIdExist).toHaveBeenCalledWith(userId);
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
            expect(userRepository.updateUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...userDataResult,
                    password: expect.any(String),
                }),
            );
        });

        it("should success execute update user without bank name", async () => {
            await updateUserCommandHandler.execute(
                userDataRequestedWithoutBankName,
            );

            expect(userRepository.isUserIdExist).toHaveBeenCalledWith(userId);
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
            expect(userRepository.updateUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...userDataResult,
                    password: expect.any(String),
                }),
            );
        });

        it("should success execute update user without bank account", async () => {
            await updateUserCommandHandler.execute(
                userDataRequestedWithoutBankAccount,
            );

            expect(userRepository.isUserIdExist).toHaveBeenCalledWith(userId);
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
            expect(userRepository.updateUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...new UserEntity<UserProps>({
                        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
                        nip: "012345678901234567",
                        nama_lengkap: "Test User",
                        email: "testuser@gmail.com",
                    } as UserProps),
                    password: expect.any(String),
                }),
            );
        });

        it("should error execute update user", async () => {
            userRepository.updateUser = mockData.updateUserError;

            try {
                await updateUserCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.isUserIdExist).toHaveBeenCalledWith(
                    userId,
                );
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
                expect(userRepository.updateUser).toHaveBeenCalledWith(
                    expect.objectContaining({
                        ...userDataResult,
                        password: expect.any(String),
                    }),
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update user on invalid accout numnber digit", async () => {
            mockedBankAccount.prototype.validateAccountNumberDigit =
                mockData.validateAccountNumberDigitError;

            try {
                await updateUserCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.isUserIdExist).toHaveBeenCalledWith(
                    userId,
                );
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
                expect(userRepository.updateUser).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input nomor rekening harus terdiri dari 12 digit",
                );
            }
        });

        it("should error execute update user on bank not found", async () => {
            mockedUserEntity.prototype.verifyBankNameMasterData =
                mockData.verifyBankNameMasterDataError;

            try {
                await updateUserCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.isUserIdExist).toHaveBeenCalledWith(
                    userId,
                );
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
                expect(userRepository.updateUser).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual("Nama bank tidak terdaftar");
            }
        });

        it("should error execute update user on subscribe event", async () => {
            eventBus.subscribe = mockData.subscribeError;

            try {
                await updateUserCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.isUserIdExist).toHaveBeenCalledWith(
                    userId,
                );
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
                expect(userRepository.updateUser).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update user on email already registered", async () => {
            mockedUserService.prototype.validateUniqueUser =
                mockData.userEmailExist;

            try {
                await updateUserCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.isUserIdExist).toHaveBeenCalledWith(
                    userId,
                );
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
                expect(userRepository.updateUser).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual("Email telah terdaftar");
            }
        });

        it("should error execute update user on user not found", async () => {
            userRepository.isUserIdExist = mockData.userNotExist;

            try {
                await updateUserCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.isUserIdExist).toHaveBeenCalledWith(
                    userId,
                );
                expect(
                    mockedUserEntity.prototype.verifyBankNameMasterData,
                ).not.toHaveBeenCalled();
                expect(
                    mockedBankAccount.prototype.validateAccountNumberDigit,
                ).not.toHaveBeenCalled();
                expect(userRepository.updateUser).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.NOT_FOUND);
                expect(appErr.message).toEqual("User tidak terdaftar");
            }
        });
    });
});
