import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { AggregateId, ApplicationError } from "../../../../../shared/abstract";
import { logger } from "../../../../../shared/util";
import { IUserQueryHandler } from "../../../application/query";
import { GuruProps, OrangTuaEntity, OrangTuaProps, UserProps } from "../../../domain/entity";
import { UserRole } from "../../../domain/enum";

type CombinedProps = UserProps & { additionalRole: OrangTuaProps | GuruProps };

export class UserQueryHandler implements IUserQueryHandler {
    constructor(private readonly dbConn: Sequelize) {}

    async getAllUsers(): Promise<UserProps[]> {
        try {
            const users = await this.dbConn.models["user"].findAll({
                attributes: { exclude: ["password"] },
            });
            return users.map((user): UserProps => {
                return user as UserProps;
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async getUserById(userId: AggregateId): Promise<UserProps> {
        try {
            const user = await this.dbConn.models["user"].findByPk(userId, {
                attributes: { exclude: ["password"] },
            });
            if (!user) {
                logger.error("user is not registered");
                throw new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    "User tidak terdaftar",
                );
            }
            return user as UserProps;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async getUserByFullName(fullName: string): Promise<UserProps> {
        try {
            const user = await this.dbConn.models["user"].findOne({
                where: { nama_lengkap: fullName },
            });
            if (!user) {
                logger.error(`user ${fullName} is not registered`);
                throw new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    `User ${fullName} tidak terdaftar`,
                );
            }
            return user as UserProps;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async getUserByEmail(email: string): Promise<CombinedProps> {
        try {
            const user = await this.dbConn.models["user"].findOne({
                where: { email: email },
            }) as UserProps;

            if (!user) {
                logger.error(`user ${email} is not found`);
                throw new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    `User ${email} tidak terdaftar`,
                );
            }
            let additionalInformation: OrangTuaProps | GuruProps = {} as OrangTuaProps | GuruProps;
            console.log(user.role)
            if (user.role && [UserRole.ADMIN, UserRole.BENDAHARA, UserRole.GURU, UserRole.KEPALA_SEKOLAH, UserRole.SEKRETARIS].includes(user.role)) {
                console.log("masuk sini")
                const responseData = await this.dbConn.models["teachers"].findOne({
                    where: { id: user.id_informasi_tambahan }
                })
                additionalInformation = responseData as unknown as GuruProps;
            } else if (user.role == UserRole.ORANG_TUA) {
                const responseData = await this.dbConn.models["parents"].findOne({
                    where: { id: user.id_informasi_tambahan }
                })
                additionalInformation = responseData as OrangTuaProps;
            }
            console.log({...user, additionalRole: additionalInformation})

            
            return {...user, additionalRole: additionalInformation}

        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
