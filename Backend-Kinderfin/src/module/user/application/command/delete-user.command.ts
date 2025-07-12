import { StatusCodes } from "http-status-codes";
import {
    AggregateId,
    ApplicationError,
    ICommandHandler,
} from "../../../../shared/abstract";
import { logger } from "../../../../shared/util";
import { UserRole } from "../../domain/enum";
import { IUserRepository } from "../../domain/repository";

export interface DeleteUserCommand {
    id: AggregateId;
    selfId: AggregateId;
}

export class DeleteUserCommandHandler
    implements ICommandHandler<DeleteUserCommand, void>
{
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(command: DeleteUserCommand): Promise<void> {
        const { id, selfId } = command;
        try {
            const user = await this.userRepository.isUserIdExist(id);
            if (!user) {
                logger.error("user is not registered");
                throw new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    "User tidak terdaftar",
                );
            }
            if (id == selfId || user.role == UserRole.SEKRETARIS) {
                logger.error(
                    "users cannot delete their own data or manager data",
                );
                throw new ApplicationError(
                    StatusCodes.FORBIDDEN,
                    "User tidak dapat menghapus data sendiri atau data manajer",
                );
            }
            await this.userRepository.deleteUser(id);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
