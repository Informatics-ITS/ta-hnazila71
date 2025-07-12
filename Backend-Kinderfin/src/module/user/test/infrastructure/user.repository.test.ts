import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../shared/abstract";
import { UserEntity, UserProps } from "../../domain/entity";
import { UserRole } from "../../domain/enum";
import { IUserRepository } from "../../domain/repository";
import { BankAccount } from "../../domain/value_object";
import { UserRepository } from "../../infrastructure/storage/repository";

describe("Testing User Repository", () => {
    const [nama_bank, pemilik_rekening, nomor_rekening] = [
        "Test Bank",
        "User A",
        "135349212211",
    ];

    const mockUserData: UserProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nip: "012345678901234567",
        nama_lengkap: "Test User",
        email: "testuser@gmail.com",
        role: UserRole.FINANCE_ADMIN,
        nama_bank: nama_bank,
        pemilik_rekening: pemilik_rekening,
        nomor_rekening: nomor_rekening,
        login_at: new Date("2023-10-08"),
    };

    const userDataRequested = new UserEntity<UserProps>({
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nip: "012345678901234567",
        nama_lengkap: "Test User",
        email: "testuser@gmail.com",
        password: "Userpass1!",
    });
    userDataRequested.setAkunBank(
        new BankAccount(
            nama_bank,
            pemilik_rekening,
            nomor_rekening,
        ),
    );

    const userDataRequestedWithoutBankAccount = new UserEntity<UserProps>({
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nip: "012345678901234567",
        nama_lengkap: "Test User",
        email: "testuser@gmail.com",
        password: "Userpass1!",
    });

    const mockData = {
        modified: jest.fn(),
        modifiedError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        find: jest.fn().mockReturnValue(mockUserData),
        findNull: jest.fn().mockReturnValue(null),
        findError: jest
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

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.models.user = {
            create: mockData.modified,
            update: mockData.modified,
            destroy: mockData.modified,
            findByPk: mockData.find,
            findOne: mockData.find,
        } as any;
        userRepository = new UserRepository(mockedDatabase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    let userId = "3679285c-707c-42ed-9c6e-9984825b22fd";
    describe("Add User", () => {
        it("should success add a user data", async () => {
            await userRepository.addUser(userDataRequested);

            expect(mockedDatabase.models.user.create).toHaveBeenCalledWith({
                ...userDataRequested,
                nama_bank: nama_bank,
                pemilik_rekening: pemilik_rekening,
                nomor_rekening: nomor_rekening,
            });
        });

        it("should error add a user data", async () => {
            mockedDatabase.models.user.create = mockData.modifiedError;

            try {
                await userRepository.addUser(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.models.user.create).toHaveBeenCalledWith({
                    ...userDataRequested,
                    nama_bank: nama_bank,
                    pemilik_rekening: pemilik_rekening,
                    nomor_rekening: nomor_rekening,
                });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Update User", () => {
        it("should success update user data", async () => {
            await userRepository.updateUser(userDataRequested);

            expect(mockedDatabase.models.user.update).toHaveBeenCalledWith(
                {
                    ...userDataRequested,
                    nama_bank: nama_bank,
                    pemilik_rekening: pemilik_rekening,
                    nomor_rekening: nomor_rekening,
                },
                {
                    where: { id: userId },
                },
            );
        });

        it("should success update user data without bank account", async () => {
            await userRepository.updateUser(
                userDataRequestedWithoutBankAccount,
            );

            expect(mockedDatabase.models.user.update).toHaveBeenCalledWith(
                {
                    ...userDataRequestedWithoutBankAccount,
                },
                {
                    where: { id: userId },
                },
            );
        });

        it("should error update user data", async () => {
            mockedDatabase.models.user.update = mockData.modifiedError;

            try {
                await userRepository.updateUser(userDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.models.user.update).toHaveBeenCalledWith(
                    {
                        ...userDataRequested,
                        nama_bank: nama_bank,
                        pemilik_rekening: pemilik_rekening,
                        nomor_rekening: nomor_rekening,
                    },
                    {
                        where: { id: userId },
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Update User Login Time", () => {
        const currentTime = new Date();
        it("should success update user login time", async () => {
            await userRepository.updateUserLoginTime(userId, currentTime);

            expect(mockedDatabase.models.user.update).toHaveBeenCalledWith(
                { login_at: currentTime },
                { where: { id: userId } },
            );
        });

        it("should success update user log out time", async () => {
            await userRepository.updateUserLoginTime(userId);

            expect(mockedDatabase.models.user.update).toHaveBeenCalledWith(
                { login_at: null },
                { where: { id: userId } },
            );
        });

        it("should error update user login time", async () => {
            mockedDatabase.models.user.update = mockData.modifiedError;

            try {
                await userRepository.updateUserLoginTime(userId, currentTime);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.models.user.update).toHaveBeenCalledWith(
                    { login_at: currentTime },
                    { where: { id: userId } },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Delete User", () => {
        it("should success delete user data", async () => {
            await userRepository.deleteUser(userId);

            expect(mockedDatabase.models.user.destroy).toHaveBeenCalledWith({
                where: { id: userId },
            });
        });

        it("should error delete user data", async () => {
            mockedDatabase.models.user.destroy = mockData.modifiedError;

            try {
                await userRepository.deleteUser(userId);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.models.user.destroy).toHaveBeenCalledWith(
                    {
                        where: { id: userId },
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Check User Data By Id", () => {
        it("should success return an user data by id", async () => {
            const user = await userRepository.isUserIdExist(userId);

            expect(mockedDatabase.models.user.findByPk).toHaveBeenCalled();
            expect(user).toEqual(mockUserData);
        });

        it("should success return an empty user data by id", async () => {
            userId = "3679285c-707c-42ed-9c6e-9984825b22fe";
            mockedDatabase.models.user.findByPk = mockData.findNull;

            const user = await userRepository.isUserIdExist(userId);

            expect(mockedDatabase.models.user.findByPk).toHaveBeenCalled();
            expect(user).toBeNull();
        });

        it("should error return an user data by id", async () => {
            mockedDatabase.models.user.findByPk = mockData.findError;

            try {
                await userRepository.isUserIdExist(userId);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.models.user.findByPk).toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Check User Data By Email", () => {
        let email = "testuser@gmail.com";
        it("should success return an user data by email", async () => {
            const user = await userRepository.isUserEmailExist(email);

            expect(mockedDatabase.models.user.findOne).toHaveBeenCalledWith({
                where: { email: email },
            });
            expect(user).toEqual(mockUserData);
        });

        it("should success return an empty user data by email", async () => {
            email = "testusera@gmail.com";
            mockedDatabase.models.user.findOne = mockData.findNull;

            const user = await userRepository.isUserEmailExist(email);

            expect(mockedDatabase.models.user.findOne).toHaveBeenCalledWith({
                where: { email: email },
            });
            expect(user).toBeNull();
        });

        it("should error return an user data by email", async () => {
            mockedDatabase.models.user.findOne = mockData.findError;

            try {
                await userRepository.isUserEmailExist(email);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.models.user.findOne).toHaveBeenCalledWith(
                    {
                        where: { email: email },
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
