import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../shared/abstract";
import { UserProps } from "../../domain/entity";
import { UserRole } from "../../domain/enum";
import { IUserRepository } from "../../domain/repository";
import { IUserService, UserService } from "../../domain/service";
import { UserRepository } from "../../infrastructure/storage/repository";

describe("Testing User Service", () => {
    const mockUser: UserProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nip: "012345678901234567",
        nama_lengkap: "Test User",
        email: "testuser@gmail.com",
        password: "Testpass1!",
        role: UserRole.FINANCE_ADMIN,
        login_at: undefined,
    };

    const mockData = {
        userEmailExist: jest.fn().mockReturnValue(mockUser),
        userEmailNotExist: jest.fn().mockReturnValue(null),
        userError: jest
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
    let userService: IUserService;

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
        } as any;
        userService = new UserService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const email = "testuser@gmail.com";
    describe("Validate Unique User", () => {
        it("should success return error duplicate user", async () => {
            const result = await userService.validateUniqueUser(
                email,
                userRepository,
            );

            expect(userRepository.isUserEmailExist).toHaveBeenCalledWith(email);
            expect(result?.message).toEqual("Email telah terdaftar");
        });

        it("should success return not duplicate user", async () => {
            userRepository.isUserEmailExist = mockData.userEmailNotExist;

            const result = await userService.validateUniqueUser(
                email,
                userRepository,
            );

            expect(userRepository.isUserEmailExist).toHaveBeenCalledWith(email);
            expect(result).toBeNull();
        });

        it("should error validate user", async () => {
            userRepository.isUserEmailExist = mockData.userError;

            try {
                await userService.validateUniqueUser(email, userRepository);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.isUserEmailExist).toHaveBeenCalledWith(
                    email,
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
