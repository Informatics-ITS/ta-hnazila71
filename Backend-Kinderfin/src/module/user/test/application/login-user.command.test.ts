import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { LoginCommand, LoginCommandHandler } from "../../application/command";
import { ITokenService } from "../../application/service";
import { UserEntity, UserProps } from "../../domain/entity";
import { UserRole } from "../../domain/enum";
import { IUserRepository } from "../../domain/repository";
import { IPasswordService } from "../../domain/service";
import { PasswordService, TokenService } from "../../infrastructure/service";
import { UserRepository } from "../../infrastructure/storage/repository";

describe("Testing Login User Command", () => {
    const userData: UserProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nip: "012345678901234567",
        nama_lengkap: "Test User",
        email: "testuser@gmail.com",
        password:
            "$2b$10$t7oxiwchWGHa/B9w0AzrYO2WH2rQbA86YSuQjSTmwIrpC/0ZXN7V2",
        role: UserRole.FINANCE_ADMIN,
        nomor_rekening: "1320294820129",
        login_at: undefined,
    };

    const userDataRequested: LoginCommand = {
        email: "testuser@gmail.com",
        password: "Userpass1!",
    };

    const mockData = {
        userEmailExist: jest.fn().mockReturnValue(userData),
        userEmailNotExist: jest.fn().mockReturnValue(null),
        updateUserLoginTime: jest.fn(),
        updateUserLoginTimeError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        passwordMatch: jest.fn().mockReturnValue(true),
        passwordNotMatch: jest.fn().mockReturnValue(false),
        generateToken: jest
            .fn()
            .mockReturnValue(
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoiNWE1M2Q1NzEtZjg1Yi00MzczLTg5MzUtYmM3ZWVmYWI3NGY2IiwibmFtYSI6IlJvb3QgVXNlciIsInJvbGUiOiJNYW5hamVyIiwiaWF0IjoxNjk2Njg5NzQwLCJleHAiOjE2OTY3MDQxNDAsImlzcyI6InBpa3RpZmluIn0.Qko0w3nW6m2ZOU4toDNrKkXsKENzue2Xun2MG42cT4A",
            ),
        generateTokenError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockedDatabase: Sequelize;
    let userRepository: IUserRepository;
    let tokenService: ITokenService;
    let passwordService: IPasswordService;
    let loginCommandHandler: ICommandHandler<LoginCommand, string>;
    jest.mock("../../domain/entity");
    let mockedUserEntity: jest.MockedClass<typeof UserEntity>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        userRepository = new UserRepository(mockedDatabase);
        userRepository = {
            isUserEmailExist: mockData.userEmailExist,
            updateUserLoginTime: mockData.updateUserLoginTime,
        } as any;
        tokenService = new TokenService();
        tokenService = {
            generateToken: mockData.generateToken,
        };
        passwordService = new PasswordService();
        loginCommandHandler = new LoginCommandHandler(
            userRepository,
            passwordService,
            tokenService,
        );
        mockedUserEntity = UserEntity as jest.MockedClass<typeof UserEntity>;
        mockedUserEntity.prototype.checkPasswordMatch = mockData.passwordMatch;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    let [email, userPassword, loginToken, userId, fullName, userRole] = [
        "testuser@gmail.com",
        "$2b$10$t7oxiwchWGHa/B9w0AzrYO2WH2rQbA86YSuQjSTmwIrpC/0ZXN7V2",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoiNWE1M2Q1NzEtZjg1Yi00MzczLTg5MzUtYmM3ZWVmYWI3NGY2IiwibmFtYSI6IlJvb3QgVXNlciIsInJvbGUiOiJNYW5hamVyIiwiaWF0IjoxNjk2Njg5NzQwLCJleHAiOjE2OTY3MDQxNDAsImlzcyI6InBpa3RpZmluIn0.Qko0w3nW6m2ZOU4toDNrKkXsKENzue2Xun2MG42cT4A",
        "3679285c-707c-42ed-9c6e-9984825b22fd",
        "Test User",
        UserRole.FINANCE_ADMIN,
    ];
    describe("Execute Login User", () => {
        it("should success execute login user", async () => {
            const token = await loginCommandHandler.execute(userDataRequested);

            expect(userRepository.isUserEmailExist).toHaveBeenCalledWith(email);
            expect(mockedUserEntity.prototype.checkPasswordMatch).toHaveBeenCalledWith(passwordService, userPassword);
            expect(userRepository.updateUserLoginTime).toHaveBeenCalled();
            expect(tokenService.generateToken).toHaveBeenCalledWith(
                userId,
                fullName,
                userRole,
            );
            expect(token).toEqual(loginToken);
        });

        it("should error execute login user on generate token", async () => {
            tokenService.generateToken = mockData.generateTokenError;

            try {
                await loginCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.isUserEmailExist).toHaveBeenCalledWith(
                    email,
                );
                expect(mockedUserEntity.prototype.checkPasswordMatch).toHaveBeenCalledWith(passwordService, userPassword);
                expect(userRepository.updateUserLoginTime).toHaveBeenCalled();
                expect(tokenService.generateToken).toHaveBeenCalledWith(
                    userId,
                    fullName,
                    userRole,
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute login user on update login time", async () => {
            userRepository.updateUserLoginTime =
                mockData.updateUserLoginTimeError;

            try {
                await loginCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.isUserEmailExist).toHaveBeenCalledWith(
                    email,
                );
                expect(mockedUserEntity.prototype.checkPasswordMatch).toHaveBeenCalledWith(passwordService, userPassword);
                expect(userRepository.updateUserLoginTime).toHaveBeenCalled();
                expect(tokenService.generateToken).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute login user on compare password", async () => {
            mockedUserEntity.prototype.checkPasswordMatch = mockData.passwordNotMatch;

            try {
                await loginCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.isUserEmailExist).toHaveBeenCalledWith(
                    email,
                );
                expect(mockedUserEntity.prototype.checkPasswordMatch).toHaveBeenCalledWith(passwordService, userPassword);
                expect(
                    userRepository.updateUserLoginTime,
                ).not.toHaveBeenCalled();
                expect(tokenService.generateToken).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual("Input password salah");
            }
        });

        it("should error execute login user on email not found", async () => {
            userRepository.isUserEmailExist = mockData.userEmailNotExist;

            try {
                await loginCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.isUserEmailExist).toHaveBeenCalledWith(
                    email,
                );
                expect(mockedUserEntity.prototype.checkPasswordMatch).not.toHaveBeenCalled();
                expect(
                    userRepository.updateUserLoginTime,
                ).not.toHaveBeenCalled();
                expect(tokenService.generateToken).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.NOT_FOUND);
                expect(appErr.message).toEqual("Email tidak terdaftar");
            }
        });
    });
});
