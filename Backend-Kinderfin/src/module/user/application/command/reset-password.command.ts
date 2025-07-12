import { IUserRepository } from "../../domain/repository/user.repository";
import { IPasswordService } from "../../domain/service/password.service";

export class ResetPasswordCommand {
    constructor(
        public readonly id: string,
        public readonly newPassword: string
    ) {}
}

export class ResetPasswordCommandHandler {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordService: IPasswordService
    ) {}

    async execute(command: ResetPasswordCommand): Promise<void> {
        const hashedPassword = await this.passwordService.hashPassword(command.newPassword);
        await this.userRepository.updatePassword(command.id, hashedPassword);
    }
}