import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../shared/abstract";
import { UserEntity, UserProps } from "../../domain/entity";
import { UserRole } from "../../domain/enum";
import { IPasswordService } from "../../domain/service";
import { BankAccount } from "../../domain/value_object";
import { PasswordService } from "../../infrastructure/service";

describe("Testing User Entity", () => {
    const [nama_bank, pemilik_rekening, nomor_rekening, hashedPassword] = [
        "Bank A",
        "User A",
        "135349212211",
        "$2b$10$t7oxiwchWGHa/B9w0AzrYO2WH2rQbA86YSuQjSTmwIrpC/0ZXN7V2",
    ];

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
        hashPassword: jest.fn().mockReturnValue(hashedPassword),
        hashPasswordError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        comparePassword: jest.fn().mockReturnValue(true),
        comparePasswordFalse: jest.fn().mockReturnValue(false),
    };

    describe("Constructor New User Entity", () => {
        it("should success match new user entity", async () => {
            const newUser = new UserEntity<UserProps>(mockUser);
            newUser.setAkunBank(
                new BankAccount(nama_bank, pemilik_rekening, nomor_rekening),
            );

            expect(newUser.id).toEqual(mockUser.id);
            expect(newUser.getNip()).toEqual(mockUser.nip);
            expect(newUser.getNamaLengkap()).toEqual(mockUser.nama_lengkap);
            expect(newUser.getEmail()).toEqual(mockUser.email);
            expect(newUser.getPassword()).toEqual(mockUser.password);
            expect(newUser.getRole()).toEqual(mockUser.role);
            expect(newUser.getAkunBank()?.getNamaBank()).toEqual(nama_bank);
            expect(newUser.getAkunBank()?.getPemilikRekening()).toEqual(
                pemilik_rekening,
            );
            expect(newUser.getAkunBank()?.getNomorRekening()).toEqual(
                nomor_rekening,
            );
            expect(newUser.getLoginAt()).toBeUndefined();
        });

        it("should error match wrong user role on new user entity", async () => {
            const mockUserRole = {
                id: "3679285c-707c-42ed-9c6e-9984825b22fd",
                nip: "012345678901234567",
                nama_lengkap: "Test User",
                email: "testuser@gmail.com",
                password: "Testpass1!",
                role: "Wrong Role",
                login_at: undefined,
            };

            try {
                new UserEntity<UserProps>(mockUserRole as UserProps);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual("Role user tidak terdaftar");
            }
        });

        it("should error match wrong password pattern on new user entity", async () => {
            mockUser.password = "Testpass!";

            try {
                new UserEntity<UserProps>(mockUser);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input password harus berisi minimal satu huruf kecil, satu huruf besar, satu angka, dan satu karakter khusus",
                );
            }
        });

        it("should error match wrong password digit on new user entity", async () => {
            mockUser.password = "MinPass";

            try {
                new UserEntity<UserProps>(mockUser);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input password harus terdiri dari 8-20 karakter",
                );
            }
        });

        it("should error match wrong email on new user entity", async () => {
            mockUser.email = "Wrong Email";

            try {
                new UserEntity<UserProps>(mockUser);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual("Format email salah");
            }
        });

        it("should error match wrong full name on new user entity", async () => {
            mockUser.nama_lengkap = "Test User 1";

            try {
                new UserEntity<UserProps>(mockUser);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input nama lengkap hanya dapat berisi huruf, koma, titik, atau spasi",
                );
            }
        });

        it("should error match wrong nip on new user entity", async () => {
            mockUser.nip = "01234567890123456f";

            try {
                new UserEntity<UserProps>(mockUser);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input nip hanya dapat berisi angka",
                );
            }
        });
    });

    const mockUserHash: UserProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nip: "012345678901234567",
        nama_lengkap: "Test User",
        email: "testuser@gmail.com",
        password: "Testpass1!",
        role: UserRole.FINANCE_ADMIN,
        login_at: undefined,
    };
    let passwordService: IPasswordService;
    describe("Set Hashed Password", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            passwordService = new PasswordService();
            passwordService.hashPassword = mockData.hashPassword;
        });
        it("should success set hashed password", async () => {
            const newUser = new UserEntity<UserProps>(mockUserHash);
            await newUser.setHashedPassword(passwordService);

            expect(passwordService.hashPassword).toHaveBeenCalledWith(
                mockUserHash.password,
            );
            expect(newUser.getPassword()).toEqual(hashedPassword);
        });

        it("should error set hashed password", async () => {
            passwordService.hashPassword = mockData.hashPasswordError;

            try {
                const newUser = new UserEntity<UserProps>(mockUserHash);
                await newUser.setHashedPassword(passwordService);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Check Matched Password", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            passwordService.comparePassword = mockData.comparePassword;
        });
        it("should success set hashed password", async () => {
            const newUser = new UserEntity<UserProps>(mockUserHash);
            const result = await newUser.checkPasswordMatch(
                passwordService,
                hashedPassword,
            );

            expect(passwordService.comparePassword).toHaveBeenCalledWith(
                mockUserHash.password,
                hashedPassword,
            );
            expect(result).toEqual(true);
        });

        it("should error set hashed password", async () => {
            passwordService.comparePassword = mockData.comparePasswordFalse;

            const newUser = new UserEntity<UserProps>(mockUserHash);
            const result = await newUser.checkPasswordMatch(
                passwordService,
                hashedPassword,
            );

            expect(passwordService.comparePassword).toHaveBeenCalledWith(
                mockUserHash.password,
                hashedPassword,
            );
            expect(result).toEqual(false);
        });
    });

    const masterDatas = [
        {
            id: "4fca6786-461f-40b8-8a32-6062ffbf6565",
            tipe: "Bank",
            nilai: "Bank B",
            aturan: "10 digit",
            deskripsi: "Status untuk rekening Bank B",
        },
    ];

    describe("Verify Bank Name Master Data", () => {
        it("should success return false verification", async () => {
            const newUser = new UserEntity<UserProps>(mockUserHash);
            newUser.setAkunBank(
                new BankAccount(nama_bank, pemilik_rekening, nomor_rekening),
            );
            const result = newUser.verifyBankNameMasterData(masterDatas);

            expect(result.constraint).toBeUndefined();
            expect(result.err?.message).toEqual("Nama bank tidak terdaftar");
        });

        it("should success return true verification", async () => {
            masterDatas.push({
                id: "d79fabb5-e776-4725-8ca5-a898e6c29511",
                tipe: "Bank",
                nilai: "Bank A",
                aturan: "12 digit",
                deskripsi: "Status untuk rekening Bank A",
            });
            const newUser = new UserEntity<UserProps>(mockUserHash);
            newUser.setAkunBank(
                new BankAccount(nama_bank, pemilik_rekening, nomor_rekening),
            );
            const result = newUser.verifyBankNameMasterData(masterDatas);

            expect(result.constraint).toEqual("12 digit");
            expect(result.err).toBeNull();
        });
    });
});
