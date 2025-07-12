import * as bcrypt from "bcrypt";
import { ApplicationError } from "../../../../shared/abstract";
import { IPasswordService } from "../../domain/service";

export class PasswordService implements IPasswordService {
    async hashPassword(password: string): Promise<string> {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            return hashedPassword;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async comparePassword(
        password: string,
        hashedPassword: string,
    ): Promise<boolean> {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
