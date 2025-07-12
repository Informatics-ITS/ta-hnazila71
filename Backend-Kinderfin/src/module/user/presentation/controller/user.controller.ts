import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, DefaultMessage } from "../../../../shared/abstract";
import {
    EventBus,
    buildResponseError,
    buildResponseSuccess,
    logger,
    validate,
} from "../../../../shared/util";
import {
    AddUserCommand,
    AddUserCommandHandler,
    DeleteUserCommand,
    DeleteUserCommandHandler,
    LoginCommand,
    LoginCommandHandler,
    LogoutCommand,
    LogoutCommandHandler,
    UpdateUserCommand,
    UpdateUserCommandHandler,
} from "../../application/command";
import { IUserQueryHandler } from "../../application/query";
import { ITokenService } from "../../application/service";
import { UserDataRetrievedEvent } from "../../domain/event";
import { IUserRepository } from "../../domain/repository";
import { IPasswordService } from "../../domain/service";
import { PasswordService, TokenService } from "../../infrastructure/service";
import {
    addGuruMapper,
    addOrangTuaMapper,
    addUserMapper,
    deleteUserMapper,
    getUserProfileMapper,
    loginMapper,
    logoutMapper,
    updateUserMapper,
    resetPasswordMapper,
} from "../mapper";
import { ResetPasswordCommand, ResetPasswordCommandHandler } from "../../application/command/reset-password.command";
// import { resetPasswordMapper } from "../mapper/";
import { AddGuruCommand, AddGuruCommandHandler } from "../../application/command/add-guru.command";
import { AddOrangTuaCommand, AddOrangTuaCommandHandler } from "../../application/command/add-orang-tua.command";
import { UserRole } from "../../domain/enum";
import { QueryTypes } from "sequelize";
import { PostgresDatabase } from "../../../../config/database.config";
import { SequelizeLogRepository } from "../../../activity_log/infrastructure/storage/repository/sequelize-log.repository";
import { CreateLogCommand } from "../../../activity_log/application/command/create-log.command";
import { buildLogDescription } from "../../../activity_log/utils/buildLogDescription";

const dbConn = new PostgresDatabase().dbConn;

const getUserEmail = async (id_user: string): Promise<string> => {
  const [user] = await dbConn.query(
    'SELECT email FROM users WHERE id = :id LIMIT 1',
    {
      replacements: { id: id_user },
      type: QueryTypes.SELECT,
    }
  );
  return (user as any)?.email || "unknown@example.com";
};

export class UserController {
    private readonly passwordService: IPasswordService;
    private readonly tokenService: ITokenService;

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly userQueryHandler: IUserQueryHandler,
        private readonly eventBus: EventBus,
    ) {
        this.passwordService = new PasswordService();
        this.tokenService = new TokenService();
        this.eventBus.subscribe(
            "UserDataRequestedByFullName",
            this.sendUserByFullName.bind(this),
        );
    }

    async login(req: Request, res: Response): Promise<void> {
        const { body } = req;
        try {
            const validData = validate(body, loginMapper) as LoginCommand;
            const loginHandler = new LoginCommandHandler(
                this.userRepository,
                this.passwordService,
                this.tokenService,
            );
            const accessToken = await loginHandler.execute(validData);
            res.cookie("access_token", accessToken, {
                expires: new Date(Date.now() + 4 * 3600 * 1000),
                maxAge: 4 * 3600 * 1000,
                httpOnly: true,
                secure: appConfig.get("/appEnv") === "production",
                sameSite: "lax",
            });
            const userData = await this.userQueryHandler.getUserByEmail(
                validData.email,
            );
            logger.info("user has been successfully logged in");

            let username: string = '';
            if (userData.role && [UserRole.ADMIN, UserRole.BENDAHARA, UserRole.GURU, UserRole.KEPALA_SEKOLAH, UserRole.SEKRETARIS].includes(userData.role)) {
                if ('nama_lengkap' in userData.additionalRole) {
                    username = userData.additionalRole.nama_lengkap || '';
                }
            } else if (userData.role === UserRole.ORANG_TUA) {
                if (userData.role === UserRole.ORANG_TUA && 'ayah' in userData.additionalRole) {
                    username = userData.additionalRole.ayah || '';
                }
            }
            buildResponseSuccess(res, StatusCodes.OK, "User berhasil login", {
                access_token: accessToken,
                role: userData!.role,
                username: username,
            });
        } catch (error) {
            logger.error("user failed to login");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        const id = res.locals.id_user;
        try {
            const validData = validate({ id }, logoutMapper) as LogoutCommand;
            const logoutHandler = new LogoutCommandHandler(this.userRepository);
            await logoutHandler.execute(validData);
            res.clearCookie("access_token");
            logger.info("user has been successfully logged out");
            buildResponseSuccess(res, StatusCodes.OK, "User berhasil logout");
        } catch (error) {
            logger.error("user failed to log out");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async viewUserProfile(req: Request, res: Response): Promise<void> {
        const id = res.locals.id_user;
        try {
            const validData = validate({ id }, getUserProfileMapper) as {
                id: string;
            };
            const user = await this.userQueryHandler.getUserById(validData.id);
            logger.info("user data has been successfully retrieved");
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                DefaultMessage.SUC_GET,
                user,
            );
        } catch (error) {
            logger.error("failed to get user profile data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async sendUserByFullName(eventData: any): Promise<void> {
        const { nama_lengkap } = eventData.data;
        try {
            const user = await this.userQueryHandler.getUserByFullName(
                nama_lengkap,
            );
            this.eventBus.publish("UserDataByFullNameRetrieved",
                new UserDataRetrievedEvent(user, "UserDataByFullNameRetrieved"),
            );
            logger.info("user data has been successfully retrieved");
        } catch (error) {
            const appErr = error as ApplicationError;
            this.eventBus.publish("UserDataByFullNameRetrieved", {
                data: {
                    status: "error",
                    code: appErr.code,
                    message: appErr.message,
                },
                eventName: "UserDataByFullNameRetrieved",
            });
            logger.error("failed to get user by full name");
        }
    }

    async getAllGuru(req: Request, res: Response): Promise<void> {
        try {
          const query = `
            SELECT 
              id, nip, nama_lengkap, jabatan
            FROM teachers
          `;
          const result = await dbConn.query(query, { type: QueryTypes.SELECT });
      
          buildResponseSuccess(res, StatusCodes.OK, "Berhasil ambil data guru", result);
        } catch (error) {
          const appErr = error as ApplicationError;
          buildResponseError(res, appErr.code, appErr.message);
        }
      }
      
      

    async addUser(req: Request, res: Response): Promise<void> {
        const { body } = req;
        try {
            const validData = validate(body, addUserMapper) as AddUserCommand;

            const existing = await dbConn.query(
                'SELECT * FROM teachers WHERE nip = :nip',
                {
                    type: QueryTypes.SELECT,
                    replacements: { nip: validData.nip },
                },
            );

            if (existing.length > 0) {
                throw new ApplicationError(StatusCodes.BAD_REQUEST, "NIP Sudah Terdaftar");
            }

            const addUserHandler = new AddUserCommandHandler(
                this.userRepository,
                this.passwordService,
                this.eventBus,
            );
            await addUserHandler.execute(validData);
            const logRepo = new SequelizeLogRepository();
            const createLog = new CreateLogCommand(logRepo);
            const email = await getUserEmail(res.locals.id_user);

            await createLog.execute({
              user_id: res.locals.id_user,
              email,
              action: "CREATE_USER",
              module: "user",
              description: buildLogDescription("CREATE_USER", validData.nama_lengkap),
            });
            logger.info("user data has been successfully added");
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_ADD,
            );
        } catch (error) {
            logger.error("failed to add new user data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async addGuru(req: Request, res: Response): Promise<void> {
        const { body } = req;
        logger.info("body" + body.nama_bank);
        try {
            const validData = validate(body, addGuruMapper) as AddGuruCommand;
            logger.info("validData" + validData.nama_bank);
            const addUserHandler = new AddGuruCommandHandler(
                this.userRepository,
                this.passwordService,
                this.eventBus,
            );
            await addUserHandler.execute(validData);
            logger.info("user data has been successfully added");
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_ADD,
            );
        } catch (error) {
            logger.error("failed to add new user data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async addOrangTua(req: Request, res: Response): Promise<void> {
        const { body } = req;
        try {
            const validData = validate(body, addOrangTuaMapper) as AddOrangTuaCommand;
            const addUserHandler = new AddOrangTuaCommandHandler(
                this.userRepository,
                this.passwordService,
                this.eventBus,
            );
            await addUserHandler.execute(validData);
            logger.info("user data has been successfully added");
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_ADD,
            );
        } catch (error) {
            logger.error("failed to add new user data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async viewAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await this.userQueryHandler.getAllUsers();
            logger.info("all user data has been successfully retrieved");
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                DefaultMessage.SUC_AGET,
                users,
            );
        } catch (error) {
            logger.error("failed to get all user data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async updateUser(req: Request, res: Response): Promise<void> {
        const { body } = req;
        body["id"] = req.params.id;
        try {
            const validData = validate(
                body,
                updateUserMapper,
            ) as UpdateUserCommand;
            const updateUserHandler = new UpdateUserCommandHandler(
                this.userRepository,
                this.passwordService,
                this.eventBus,
            );
            await updateUserHandler.execute(validData);
            logger.info("user data has been successfully updated");
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_UPDT,
            );
        } catch (error) {
            logger.error("failed to update user data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        const selfId = res.locals.id_user;
        const id = req.params.id;
        try {
            const validData = validate(
                { id, selfId },
                deleteUserMapper,
            ) as DeleteUserCommand;
            const deleteUserHandler = new DeleteUserCommandHandler(
                this.userRepository,
            );
            await deleteUserHandler.execute(validData);
            const logRepo = new SequelizeLogRepository();
            const createLog = new CreateLogCommand(logRepo);
            
            const [userInfo] = await dbConn.query(
              `SELECT t.nama_lengkap FROM users u
               JOIN teachers t ON u.id_informasi_tambahan = t.id
               WHERE u.id = :id LIMIT 1`,
              {
                replacements: { id },
                type: QueryTypes.SELECT,
              }
            );
            let nama = (userInfo as any)?.nama_lengkap;
            if (!nama) {
              const [fallbackUser] = await dbConn.query(
                'SELECT email FROM users WHERE id = :id',
                {
                  replacements: { id },
                  type: QueryTypes.SELECT,
                }
              );
              nama = (fallbackUser as any)?.email || id;
            }
            if (!nama) {
              const [fallbackUser] = await dbConn.query(
                'SELECT email FROM users WHERE id = :id',
                {
                  replacements: { id },
                  type: QueryTypes.SELECT,
                }
              );
              nama = (fallbackUser as any)?.email || id;
            }

            const email = await getUserEmail(res.locals.id_user);
            
            await createLog.execute({
              user_id: res.locals.id_user,
              email,
              action: "DELETE_USER",
              module: "user",
              description: buildLogDescription("DELETE_USER", nama),
            });
            logger.info("user data has been successfully removed");
            buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_DEL);
        } catch (error) {
            logger.error("failed to delete user data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }
    async resetPassword(req: Request, res: Response): Promise<void> {
        const { id, newPassword } = req.body;
        try {
            const validData = validate({ id, newPassword }, resetPasswordMapper) as ResetPasswordCommand;

            const resetPasswordHandler = new ResetPasswordCommandHandler(
                this.userRepository,
                this.passwordService
            );
            await resetPasswordHandler.execute(validData);

            const logRepo = new SequelizeLogRepository();
            const createLog = new CreateLogCommand(logRepo);
            const email = await getUserEmail(res.locals.id_user);

            const [userInfo] = await dbConn.query(
              `SELECT t.nama_lengkap FROM users u
               JOIN teachers t ON u.id_informasi_tambahan = t.id
               WHERE u.id = :id LIMIT 1`,
              {
                replacements: { id: validData.id },
                type: QueryTypes.SELECT,
              }
            );
            let nama = (userInfo as any)?.nama_lengkap;
            if (!nama) {
              const [fallbackUser] = await dbConn.query(
                'SELECT email FROM users WHERE id = :id',
                {
                  replacements: { id: validData.id },
                  type: QueryTypes.SELECT,
                }
              );
              nama = (fallbackUser as any)?.email || validData.id;
            }

            await createLog.execute({
              user_id: res.locals.id_user,
              email,
              action: "RESET_PASSWORD_USER",
              module: "user",
              description: buildLogDescription("RESET_PASSWORD_USER", nama),
            });
            logger.info("password has been successfully reset");
            buildResponseSuccess(res, StatusCodes.OK, "Password berhasil direset");
        } catch (error) {
            logger.error("failed to reset password");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }
}