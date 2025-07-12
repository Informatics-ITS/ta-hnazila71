import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { LogoutCommand, LogoutCommandHandler } from "../../application/command";
import { IUserRepository } from "../../domain/repository";
import { UserRepository } from "../../infrastructure/storage/repository";

describe("Testing Log Out User Command", () => {
    const userDataRequested: LogoutCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
    };

    const mockData = {
        updateUserLoginTime: jest.fn(),
        updateUserLoginTimeError: jest
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
    let logoutCommandHandler: ICommandHandler<LogoutCommand, void>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        userRepository = new UserRepository(mockedDatabase);
        userRepository = {
            updateUserLoginTime: mockData.updateUserLoginTime,
        } as any;
        logoutCommandHandler = new LogoutCommandHandler(userRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const userId = "3679285c-707c-42ed-9c6e-9984825b22fd";
    describe("Execute Log Out User", () => {
        it("should success execute log out user", async () => {
            await logoutCommandHandler.execute(userDataRequested);

            expect(userRepository.updateUserLoginTime).toHaveBeenCalledWith(
                userId,
            );
        });

        it("should error execute logout user", async () => {
            userRepository.updateUserLoginTime =
                mockData.updateUserLoginTimeError;

            try {
                await logoutCommandHandler.execute(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(userRepository.updateUserLoginTime).toHaveBeenCalledWith(
                    userId,
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
