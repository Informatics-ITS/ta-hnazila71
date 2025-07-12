import { StatusCodes } from "http-status-codes";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { logger } from "../../../../shared/util";
import { UserEntity, UserProps } from "../../domain/entity";
import { IUserRepository } from "../../domain/repository";
import { IPasswordService } from "../../domain/service";
import { ITokenService } from "../service";

export interface LoginCommand {
    email: string;
    password: string;
}

export class LoginCommandHandler
    implements ICommandHandler<LoginCommand, string> {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordService: IPasswordService,
        private readonly tokenService: ITokenService,
    ) { }

    async execute(command: LoginCommand): Promise<string> {
        const { email, password } = command;
        try {
            const user = await this.userRepository.isUserEmailExist(email);
            if (!user) {
                logger.error("email is not registered");
                throw new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    "Email tidak terdaftar",
                );
            }
            const userData = new UserEntity<UserProps>({
                ...user,
                password: password,
            });
            if (
                !(await userData.checkPasswordMatch(
                    this.passwordService,
                    user.password!,
                ))
            ) {
                logger.error("wrong password input");
                throw new ApplicationError(
                    StatusCodes.BAD_REQUEST,
                    "Input password salah",
                );
            }
            await this.userRepository.updateUserLoginTime(
                userData.id,
                new Date(),
            );
            console.log("Waktu saat generate token:", new Date().toISOString());
            const token = await this.tokenService.generateToken(
                userData.id,
                // userData.getNamaLengkap()!,
                userData.getEmail()!,
                userData.getRole()!,
                userData.getIdInformasiTambahan()!
            );
            return token;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
