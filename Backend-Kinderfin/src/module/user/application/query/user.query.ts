import { AggregateId } from "../../../../shared/abstract";
import { GuruProps, OrangTuaProps, UserProps } from "../../domain/entity";

type CombinedProps = UserProps & { additionalRole: OrangTuaProps | GuruProps };

export interface IUserQueryHandler {
    getAllUsers(): Promise<UserProps[]>;
    getUserById(userId: AggregateId): Promise<UserProps>;
    getUserByFullName(fullName: string): Promise<UserProps>;
    getUserByEmail(email: string): Promise<CombinedProps>;
}
