import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import {
    DeleteUserCommand,
    DeleteUserCommandHandler,
} from "../../application/command";
import { UserProps } from "../../domain/entity";
import { UserRole } from "../../domain/enum";
import { IUserRepository } from "../../domain/repository";
import { UserRepository } from "../../infrastructure/storage/repository";

describe("Testing Delete User Command", () => {
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

    const userDataManager: UserProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nip: "012345678901234567",
        nama_lengkap: "Test User",
        email: "testuser@gmail.com",
        password:
            "$2b$10$t7oxiwchWGHa/B9w0AzrYO2WH2rQbA86YSuQjSTmwIrpC/0ZXN7V2",
        role: UserRole.MANAGER,
        nomor_rekening: "1320294820129",
        login_at: undefined,
    };

    const userDataRequested: DeleteUserCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        selfId: "3673205c-707c-927j-9c6e-9290185b22fe",
    };

    const mockData = {
        userIdExist: jest.fn().mockReturnValue(userData),
        userIdManagerExist: jest.fn().mockReturnValue(userDataManager),
        userIdNotExist: jest.fn().mockReturnValue(null),
        deleteUser: jest.fn(),
        deleteUserError: jest
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
    let deleteUserCommandHandler: ICommandHandler<DeleteUserCommand, void>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        userRepository = new UserRepository(mockedDatabase);
        userRepository = {
            isUserIdExist: mockData.userIdExist,
            deleteUser: mockData.deleteUser,
        } as any;
        deleteUserCommandHandler = new DeleteUserCommandHandler(userRepository);
    });

    const userId = "3679285c-707c-42ed-9c6e-9984825b22fd";
    describe("Execute Delete User", () => {
        it("should success execute delete user", async () => {
            await deleteUserCommandHandler.execute(userDataRequested);

            expect(userRepository.isUserIdExist).toHaveBeenCalledWith(userId);
            expect(userRepository.deleteUser).toHaveBeenCalledWith(userId);
        });

        it("should error execute delete user", async () => {
            userRepository.deleteUser = mockData.deleteUserError;

            try {
                await deleteUserCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.isUserIdExist).toHaveBeenCalledWith(
                    userId,
                );
                expect(userRepository.deleteUser).toHaveBeenCalledWith(userId);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute delete user on delete self", async () => {
            userDataRequested.selfId = "3679285c-707c-42ed-9c6e-9984825b22fd";

            try {
                await deleteUserCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.isUserIdExist).toHaveBeenCalledWith(
                    userId,
                );
                expect(userRepository.deleteUser).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.FORBIDDEN);
                expect(appErr.message).toEqual(
                    "User tidak dapat menghapus data sendiri atau data manajer",
                );
            }
        });

        it("should error execute delete user on delete manager", async () => {
            userDataRequested.selfId = "3673205c-707c-927j-9c6e-9290185b22fe";
            userRepository.isUserIdExist = mockData.userIdManagerExist;

            try {
                await deleteUserCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.isUserIdExist).toHaveBeenCalledWith(
                    userId,
                );
                expect(userRepository.deleteUser).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.FORBIDDEN);
                expect(appErr.message).toEqual(
                    "User tidak dapat menghapus data sendiri atau data manajer",
                );
            }
        });

        it("should error execute delete user on user not found", async () => {
            userRepository.isUserIdExist = mockData.userIdNotExist;

            try {
                await deleteUserCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.isUserIdExist).toHaveBeenCalledWith(
                    userId,
                );
                expect(userRepository.deleteUser).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.NOT_FOUND);
                expect(appErr.message).toEqual("User tidak terdaftar");
            }
        });
    });
});
