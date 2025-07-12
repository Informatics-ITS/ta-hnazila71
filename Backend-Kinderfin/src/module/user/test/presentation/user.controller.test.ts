import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as httpMocks from "node-mocks-http";
import { Sequelize } from "sequelize";
import { ApplicationError, DefaultMessage } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import {
    AddUserCommandHandler,
    DeleteUserCommandHandler,
    LoginCommandHandler,
    LogoutCommandHandler,
    UpdateUserCommandHandler,
} from "../../application/command";
import { IUserQueryHandler } from "../../application/query";
import { UserProps } from "../../domain/entity";
import { UserRole } from "../../domain/enum";
import { UserDataRetrievedEvent } from "../../domain/event";
import { IUserRepository } from "../../domain/repository";
import { UserQueryHandler } from "../../infrastructure/storage/query";
import { UserRepository } from "../../infrastructure/storage/repository";
import { UserController } from "../../presentation/controller";

describe("Testing User Controller", () => {
    const userDataResult: UserProps[] = [
        {
            id: "5a53d571-f85b-4373-8935-bc7eefab74f6",
            nip: "010203040506070809",
            nama_lengkap: "Test User A",
            email: "testusera@gmail.com",
            role: UserRole.FINANCE_ADMIN,
            nama_bank: "Test Bank",
            pemilik_rekening: "User A",
            nomor_rekening: "1320294820129",
        },
        {
            id: "954da047-1c61-428d-b992-508d427136b7",
            nip: "012345678901234567",
            nama_lengkap: "Test User B",
            email: "testuserb@gmail.com",
            role: UserRole.MANAGER,
            nama_bank: "Test Bank",
            pemilik_rekening: "User B",
            nomor_rekening: "135349212211",
        },
        {
            id: "69baf182-5e75-4c92-bfe0-dd98571a904e",
            nip: "012345678901234566",
            nama_lengkap: "Test User C",
            email: "testuserc@gmail.com",
            role: UserRole.FRONT_OFFICE,
            nama_bank: "Test Bank",
            pemilik_rekening: "User C",
            nomor_rekening: "1323483018135",
        },
    ];

    const loginToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoiZDhjNjMwODQtOWFkYi00ZWY5LWI3MmEtNjBjMDNiMmVmNTNjIiwibmFtYSI6IlRlc3QgVXNlciIsInJvbGUiOiJBZG1pbmlzdHJhdG9yIEtldWFuZ2FuIiwiaWF0IjoxNjk5Mzg0NjY1LCJleHAiOjE2OTkzOTkwNjUsImlzcyI6InBpa3RpZmluIn0.D_G08zTKXWBEKw0hDLMXb6DvTRy7tfSinFiPu81bIxU";
    const sentMessage = {
        success: {
            login: {
                status: "success",
                message: "User berhasil login",
                data: { access_token: loginToken },
            },
            logout: {
                status: "success",
                message: "User berhasil logout",
            },
            add: {
                status: "success",
                message: DefaultMessage.SUC_ADD,
            },
            view: {
                status: "success",
                message: DefaultMessage.SUC_AGET,
                data: userDataResult,
            },
            viewProfile: {
                status: "success",
                message: DefaultMessage.SUC_GET,
                data: userDataResult[0],
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
        notFound: {
            user: {
                status: "failed",
                error: "User tidak terdaftar",
            },
        },
    };

    const fullName = "Test User A";
    const mockData = {
        execute: jest.fn(),
        executeLogin: jest
            .fn()
            .mockReturnValue(
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoiZDhjNjMwODQtOWFkYi00ZWY5LWI3MmEtNjBjMDNiMmVmNTNjIiwibmFtYSI6IlRlc3QgVXNlciIsInJvbGUiOiJBZG1pbmlzdHJhdG9yIEtldWFuZ2FuIiwiaWF0IjoxNjk5Mzg0NjY1LCJleHAiOjE2OTkzOTkwNjUsImlzcyI6InBpa3RpZmluIn0.D_G08zTKXWBEKw0hDLMXb6DvTRy7tfSinFiPu81bIxU",
            ),
        executeError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        json: jest.fn(),
        cookie: jest.fn(),
        publish: jest.fn(),
        getAllUsers: jest.fn().mockReturnValue(userDataResult),
        getUserById: jest.fn().mockReturnValue(userDataResult[0]),
        getUserByFullName: jest.fn().mockReturnValue(userDataResult[0]),
        getUserNotFound: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    "User tidak terdaftar",
                ),
            ),
        getFullNameNotFound: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    `User ${fullName} tidak terdaftar`,
                ),
            ),
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
    let userRepository: IUserRepository;
    let userQueryHandler: IUserQueryHandler;
    let eventBus: EventBus;
    let userController: UserController;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        userRepository = new UserRepository(mockedDatabase);
        userQueryHandler = new UserQueryHandler(mockedDatabase);
        userQueryHandler = {
            getAllUsers: mockData.getAllUsers,
            getUserById: mockData.getUserById,
            getUserByFullName: mockData.getUserByFullName,
        } as any;
        eventBus = new EventBus();
        eventBus.publish = mockData.publish;
        userController = new UserController(
            userRepository,
            userQueryHandler,
            eventBus,
        );
        mockResponse = httpMocks.createResponse();
        mockResponse.json = mockData.json;
        mockResponse.cookie = mockData.cookie;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    jest.mock("../../application/command");
    const [email, requestLoginUserData, userDataRequested, userDataRequestedFail] =
        [
            "testusera@gmail.com",
            {
                email: "testusera@gmail.com",
                password: "Userpass1!",
            },
            {
                nip: "010203040506070809",
                nama_lengkap: "Test User A",
                email: "testusera@gmail.com",
                password: "Userpass1!",
                nama_bank: "Test Bank",
                pemilik_rekening: "User A",
                nomor_rekening: "1320294820129",
            },
            {
                nip: 12345678901234567,
                nama_lengkap: "Test User 77",
                email: "testuser@gmail.com",
                password: "Userpass1!",
                nama_bank: "Test Bank",
                pemilik_rekening: "User A",
                nomor_rekening: "1320294820129",
            },
        ];
    let mockedLoginCommandHandler: jest.MockedClass<typeof LoginCommandHandler>;
    describe("Login User Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, requestLoginUserData),
            });
            mockedLoginCommandHandler = LoginCommandHandler as jest.MockedClass<
                typeof LoginCommandHandler
            >;
            mockedLoginCommandHandler.prototype.execute = mockData.executeLogin;
        });

        it("should success return response login user", async () => {
            await userController.login(mockRequest, mockResponse);

            expect(
                mockedLoginCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...requestLoginUserData,
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.login,
            );
        });

        it("should error return response login user", async () => {
            mockedLoginCommandHandler.prototype.execute = mockData.executeError;

            await userController.login(mockRequest, mockResponse);

            expect(
                mockedLoginCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...requestLoginUserData,
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response login user on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, { email: email }),
            });

            await userController.login(mockRequest, mockResponse);

            expect(
                mockedLoginCommandHandler.prototype.execute,
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

    const userId = "5a53d571-f85b-4373-8935-bc7eefab74f6";
    let mockedLogoutCommandHandler: jest.MockedClass<
        typeof LogoutCommandHandler
    >;
    describe("Log Out User Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockResponse.locals.id_user = userId;
            mockedLogoutCommandHandler =
                LogoutCommandHandler as jest.MockedClass<
                    typeof LogoutCommandHandler
                >;
            mockedLogoutCommandHandler.prototype.execute = mockData.execute;
        });

        it("should success return response log out user", async () => {
            await userController.logout(mockRequest, mockResponse);

            expect(
                mockedLogoutCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({ id: userId });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.logout,
            );
        });

        it("should error return response log out user", async () => {
            mockedLogoutCommandHandler.prototype.execute =
                mockData.executeError;

            await userController.logout(mockRequest, mockResponse);

            expect(
                mockedLogoutCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({ id: userId });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response log out user on validate request", async () => {
            mockResponse.locals.id_user = "5a53d571-f85b-4373-8935-bc7eefab74f";

            await userController.logout(mockRequest, mockResponse);

            expect(
                mockedLogoutCommandHandler.prototype.execute,
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

    describe("View User Profile Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockResponse.locals.id_user = userId;
        });

        it("should success return response view user profile", async () => {
            await userController.viewUserProfile(mockRequest, mockResponse);

            expect(userQueryHandler.getUserById).toHaveBeenCalledWith(userId);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.viewProfile,
            );
        });

        it("should error return response view user profile", async () => {
            userQueryHandler.getUserById = mockData.getError;

            await userController.viewUserProfile(mockRequest, mockResponse);

            expect(userQueryHandler.getUserById).toHaveBeenCalledWith(userId);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response view user profile on user not found", async () => {
            userQueryHandler.getUserById = mockData.getUserNotFound;

            await userController.viewUserProfile(mockRequest, mockResponse);

            expect(userQueryHandler.getUserById).toHaveBeenCalledWith(userId);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.NOT_FOUND);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.notFound.user,
            );
        });

        it("should error return response view user profile on validate request", async () => {
            mockResponse.locals.id_user = "5a53d571-f85b-4373-8935-bc7eefab74f";

            await userController.viewUserProfile(mockRequest, mockResponse);

            expect(userQueryHandler.getUserById).not.toHaveBeenCalled();
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

    const [requestSendUserData, userDataRetrieved, userDataRetrievedEventName] =
        [
            {
                data: { nama_lengkap: fullName },
                eventName: "userDataRequestedByFullName",
            },
            {
                id: "5a53d571-f85b-4373-8935-bc7eefab74f6",
                nip: "010203040506070809",
                nama_lengkap: "Test User A",
                email: "testusera@gmail.com",
                role: UserRole.FINANCE_ADMIN,
                nama_bank: "Test Bank",
                pemilik_rekening: "User A",
                nomor_rekening: "1320294820129",
            },
            "UserDataByFullNameRetrieved",
        ];
    const userDataRetrievedSuccessEvent = new UserDataRetrievedEvent(
        userDataRetrieved,
        userDataRetrievedEventName,
    );
    const userDataRetrievedNullEvent = {
        data: {
            status: "error",
            code: StatusCodes.NOT_FOUND,
            message: `User ${fullName} tidak terdaftar`,
        },
        eventName: userDataRetrievedEventName,
    };
    const userDataRetrievedFailedEvent = {
        data: {
            status: "error",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
        },
        eventName: userDataRetrievedEventName,
    };
    describe("Send User By Full Name Controller", () => {
        it("should success return response send user by full name", async () => {
            await userController.sendUserByFullName(requestSendUserData);

            expect(userQueryHandler.getUserByFullName).toHaveBeenCalledWith(
                fullName,
            );
            expect(eventBus.publish).toHaveBeenCalledWith(
                userDataRetrievedEventName,
                {
                    ...userDataRetrievedSuccessEvent,
                    eventOccurred: expect.anything(),
                },
            );
        });

        it("should error return response send user by full name not found", async () => {
            userQueryHandler.getUserByFullName = mockData.getFullNameNotFound;

            await userController.sendUserByFullName(requestSendUserData);

            expect(userQueryHandler.getUserByFullName).toHaveBeenCalledWith(
                fullName,
            );
            expect(eventBus.publish).toHaveBeenCalledWith(
                userDataRetrievedEventName,
                userDataRetrievedNullEvent,
            );
        });

        it("should error return response send user by full name", async () => {
            userQueryHandler.getUserByFullName = mockData.getError;

            await userController.sendUserByFullName(requestSendUserData);

            expect(userQueryHandler.getUserByFullName).toHaveBeenCalledWith(
                fullName,
            );
            expect(eventBus.publish).toHaveBeenCalledWith(
                userDataRetrievedEventName,
                userDataRetrievedFailedEvent,
            );
        });
    });

    let mockedAddUserCommandHandler: jest.MockedClass<
        typeof AddUserCommandHandler
    >;
    describe("Add User Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, userDataRequested),
            });
            mockedAddUserCommandHandler =
                AddUserCommandHandler as jest.MockedClass<
                    typeof AddUserCommandHandler
                >;
            mockedAddUserCommandHandler.prototype.execute = mockData.execute;
        });

        it("should success return response register user", async () => {
            await userController.addUser(mockRequest, mockResponse);

            expect(
                mockedAddUserCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith(userDataRequested);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.add,
            );
        });

        it("should error return response register user", async () => {
            mockedAddUserCommandHandler.prototype.execute =
                mockData.executeError;

            await userController.addUser(mockRequest, mockResponse);

            expect(
                mockedAddUserCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith(userDataRequested);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response register user on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, userDataRequestedFail),
            });

            await userController.addUser(mockRequest, mockResponse);

            expect(
                mockedAddUserCommandHandler.prototype.execute,
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

    describe("View All Users Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest();
        });

        it("should success return response view all users", async () => {
            await userController.viewAllUsers(mockRequest, mockResponse);

            expect(userQueryHandler.getAllUsers).toHaveBeenCalled();
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.view,
            );
        });

        it("should error return response view all users", async () => {
            userQueryHandler.getAllUsers = mockData.getError;

            await userController.viewAllUsers(mockRequest, mockResponse);

            expect(userQueryHandler.getAllUsers).toHaveBeenCalled();
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });
    });

    let mockedUpdateUserCommandHandler: jest.MockedClass<
        typeof UpdateUserCommandHandler
    >;
    describe("Update User Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, userDataRequested),
                params: Object.assign({}, { id: userId }),
            });
            mockedUpdateUserCommandHandler =
                UpdateUserCommandHandler as jest.MockedClass<
                    typeof UpdateUserCommandHandler
                >;
            mockedUpdateUserCommandHandler.prototype.execute = mockData.execute;
        });

        it("should success return response update user", async () => {
            await userController.updateUser(mockRequest, mockResponse);

            expect(
                mockedUpdateUserCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...userDataRequested,
                id: userId,
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.update,
            );
        });

        it("should error return response update user on update data", async () => {
            mockedUpdateUserCommandHandler.prototype.execute =
                mockData.executeError;

            await userController.updateUser(mockRequest, mockResponse);

            expect(
                mockedUpdateUserCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...userDataRequested,
                id: userId,
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response update user on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, userDataRequestedFail),
                params: Object.assign(
                    {},
                    { id: "5a53d571-f85b-4373-8935-bc7eefab74f" },
                ),
            });

            await userController.updateUser(mockRequest, mockResponse);

            expect(
                mockedUpdateUserCommandHandler.prototype.execute,
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

    const [deletedUserId] = ["69baf182-5e75-4c92-bfe0-dd98571a904e"];
    let mockedDeleteUserCommandHandler: jest.MockedClass<
        typeof DeleteUserCommandHandler
    >;
    describe("Delete User Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                params: Object.assign({}, { id: deletedUserId }),
            });
            mockResponse.locals.id_user = userId;
            mockedDeleteUserCommandHandler =
                DeleteUserCommandHandler as jest.MockedClass<
                    typeof DeleteUserCommandHandler
                >;
            mockedDeleteUserCommandHandler.prototype.execute = mockData.execute;
        });

        it("should success return response delete user", async () => {
            await userController.deleteUser(mockRequest, mockResponse);

            expect(
                mockedDeleteUserCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({ id: deletedUserId, selfId: userId });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.delete,
            );
        });

        it("should error return response delete user on delete data", async () => {
            mockedDeleteUserCommandHandler.prototype.execute =
                mockData.executeError;

            await userController.deleteUser(mockRequest, mockResponse);

            expect(
                mockedDeleteUserCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({ id: deletedUserId, selfId: userId });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response delete user on validate request", async () => {
            mockRequest.params.id = "5a53d571-f85b-4373-8935-bc7eefab74f";

            await userController.deleteUser(mockRequest, mockResponse);

            expect(
                mockedDeleteUserCommandHandler.prototype.execute,
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
