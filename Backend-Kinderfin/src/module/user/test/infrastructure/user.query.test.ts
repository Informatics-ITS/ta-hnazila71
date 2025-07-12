import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../shared/abstract";
import { UserProps } from "../../domain/entity";
import { UserRole } from "../../domain/enum";
import { UserQueryHandler } from "../../infrastructure/storage/query";
import { IUserQueryHandler } from "./../../application/query";

describe("Testing User Query", () => {
    const mockUserData: UserProps[] = [
        {
            id: "5a53d571-f85b-4373-8935-bc7eefab74f6",
            nip: "010203040506070809",
            nama_lengkap: "Test User A",
            email: "testusera@gmail.com",
            role: UserRole.FINANCE_ADMIN,
            nama_bank: "Test Bank",
            pemilik_rekening: "User A",
            nomor_rekening: "1320294820129",
            login_at: new Date("2023-10-08"),
        },
        {
            id: "954da047-1c61-428d-b992-508d427136b7",
            nip: "012345678901234567",
            nama_lengkap: "Test User B",
            email: "testuserb@gmail.com",
            role: UserRole.FRONT_OFFICE,
            nama_bank: "Test Bank",
            pemilik_rekening: "User B",
            nomor_rekening: "1320294820129",
            login_at: new Date("2023-10-08"),
        },
    ];

    const mockData = {
        findAll: jest.fn().mockReturnValue(mockUserData),
        findByPk: jest.fn().mockReturnValue(mockUserData[0]),
        findOne: jest.fn().mockReturnValue(mockUserData[1]),
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
    let userQueryHandler: IUserQueryHandler;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.models.user = {
            findAll: mockData.findAll,
            findByPk: mockData.findByPk,
            findOne: mockData.findOne,
        } as any;
        userQueryHandler = new UserQueryHandler(mockedDatabase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Get All Users", () => {
        it("should success return all user datas", async () => {
            const users = await userQueryHandler.getAllUsers();

            expect(mockedDatabase.models.user.findAll).toHaveBeenCalled();
            expect(users).toEqual(mockUserData);
        });

        it("should error return all user datas", async () => {
            mockedDatabase.models.user.findAll = mockData.findError;

            try {
                await userQueryHandler.getAllUsers();
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.models.user.findAll).toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Get User Data By Id", () => {
        let userId = "5a53d571-f85b-4373-8935-bc7eefab74f6";
        it("should success return an user data by id", async () => {
            const user = await userQueryHandler.getUserById(userId);

            expect(mockedDatabase.models.user.findByPk).toHaveBeenCalledWith(
                userId,
                {
                    attributes: { exclude: ["password"] },
                },
            );
            expect(user).toEqual(mockUserData[0]);
        });

        it("should error return an user data by id", async () => {
            mockedDatabase.models.user.findByPk = mockData.findError;

            try {
                await userQueryHandler.getUserById(userId);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.user.findByPk,
                ).toHaveBeenCalledWith(userId, {
                    attributes: { exclude: ["password"] },
                });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error return an empty user data by id", async () => {
            userId = "5a53d571-f85b-4373-8935-bc7eefab74f5";
            mockedDatabase.models.user.findByPk = mockData.findNull;

            try {
                await userQueryHandler.getUserById(userId);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.user.findByPk,
                ).toHaveBeenCalledWith(userId, {
                    attributes: { exclude: ["password"] },
                });
                expect(appErr.code).toEqual(StatusCodes.NOT_FOUND);
                expect(appErr.message).toEqual("User tidak terdaftar");
            }
        });
    });

    describe("Get User Data By Full Name", () => {
        const fullName = "Test User B";
        it("should success return an user data by full name", async () => {
            const user = await userQueryHandler.getUserByFullName(fullName);

            expect(mockedDatabase.models.user.findOne).toHaveBeenCalledWith({
                where: { nama_lengkap: fullName },
            });
            expect(user).toEqual(mockUserData[1]);
        });

        it("should error return an empty user data by full name", async () => {
            mockedDatabase.models.user.findOne = mockData.findNull;

            try {
                await userQueryHandler.getUserByFullName(fullName);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.models.user.findOne).toHaveBeenCalledWith(
                    {
                        where: { nama_lengkap: fullName },
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.NOT_FOUND);
                expect(appErr.message).toEqual(
                    `User ${fullName} tidak terdaftar`,
                );
            }
        });

        it("should error return an user data by full name", async () => {
            mockedDatabase.models.user.findOne = mockData.findError;

            try {
                await userQueryHandler.getUserByFullName(fullName);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.models.user.findOne).toHaveBeenCalledWith(
                    {
                        where: { nama_lengkap: fullName },
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
