import { ApplicationError } from "../../../../shared/abstract";
import { IUserRepository } from "../repository";

const ErrorUserAlreadyExist = "Email telah terdaftar";

export interface IUserService {
    validateUniqueUser(
        email: string,
        userRepository: IUserRepository,
    ): Promise<Error | null>;
}

export class UserService implements IUserService {
    async validateUniqueUser(
        email: string,
        userRepository: IUserRepository,
    ): Promise<Error | null> {
        try {
            return (await userRepository.isUserEmailExist(email)) != null
                ? Error(ErrorUserAlreadyExist)
                : null;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
