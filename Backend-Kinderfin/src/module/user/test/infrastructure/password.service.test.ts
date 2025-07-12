import * as bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../shared/abstract";
import { IPasswordService } from "../../domain/service";
import { PasswordService } from "../../infrastructure/service";

jest.mock("bcrypt", () => {
    return {
        hash: jest
            .fn()
            .mockResolvedValue(
                "$2y$10$pKxkosWW8Lp5DRc8ypg90eZcw7V4QLrhCsRL9kaD8kBUbwg1seary",
            ),
        compare: jest.fn().mockResolvedValue(true),
    };
});

describe("Testing Password Service", () => {
    const [inputPassword, hashedPassword] = [
        "Testpass1!",
        "$2y$10$pKxkosWW8Lp5DRc8ypg90eZcw7V4QLrhCsRL9kaD8kBUbwg1seary",
    ];

    let passwordService: IPasswordService;

    beforeEach(() => {
        jest.clearAllMocks();
        passwordService = new PasswordService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Hash Password", () => {
        it("should success return hash password", async () => {
            const password = await passwordService.hashPassword(inputPassword);

            expect(bcrypt.hash).toHaveBeenCalledWith(inputPassword, 10);
            expect(password).toEqual(hashedPassword);
        });

        it("should error return hash password", async () => {
            (bcrypt.hash as jest.Mock).mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            );

            try {
                await passwordService.hashPassword(inputPassword);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(bcrypt.hash).toHaveBeenCalledWith(inputPassword, 10);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Compare Password", () => {
        it("should success return compare password", async () => {
            const password = await passwordService.comparePassword(
                inputPassword,
                hashedPassword,
            );

            expect(bcrypt.compare).toHaveBeenCalledWith(
                inputPassword,
                hashedPassword,
            );
            expect(password).toBeTruthy();
        });

        it("should error return compare password", async () => {
            (bcrypt.compare as jest.Mock).mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            );

            try {
                await passwordService.comparePassword(
                    inputPassword,
                    hashedPassword,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(bcrypt.compare).toHaveBeenCalledWith(
                    inputPassword,
                    hashedPassword,
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
