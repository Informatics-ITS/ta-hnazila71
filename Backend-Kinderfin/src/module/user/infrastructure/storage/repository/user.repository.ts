import { Sequelize, QueryTypes } from "sequelize";
import { AggregateId, ApplicationError } from "../../../../../shared/abstract";
import { GuruEntity, GuruProps, OrangTuaEntity, OrangTuaProps, UserEntity, UserProps } from "../../../domain/entity";
import { IUserRepository } from "../../../domain/repository";
import { logger } from "../../../../../shared/util";


export class UserRepository implements IUserRepository {
    constructor(private readonly dbConn: Sequelize) {}

    async addUser(userData: UserEntity<UserProps>): Promise<void> {
        try {
            const role = userData.getRole();
            const rolesToSync = ["Guru", "Bendahara", "Kepala Sekolah", "Sekretaris"];
    
            if (rolesToSync.includes(role!)) {
                await this.dbConn.transaction(async (t) => {
                    // Simpan ke teachers
                    const guru = await this.dbConn.models["teachers"].create(
                        {
                            nip: userData.getNip(),
                            jabatan: role,
                            nama_lengkap: userData.getNamaLengkap(),
                            nama_bank: userData.getAkunBank()?.getNamaBank(),
                            pemilik_rekening: userData.getAkunBank()?.getPemilikRekening(),
                            nomor_rekening: userData.getAkunBank()?.getNomorRekening(),
                        },
                        { transaction: t }
                    );
    
                    // Simpan ke users dengan id_informasi_tambahan dari guru
                    await this.dbConn.models["user"].create(
                        {
                            id: userData.getId(),
                            id_informasi_tambahan: guru.get("id"),
                            nip: userData.getNip(),
                            nama_lengkap: userData.getNamaLengkap(),
                            email: userData.getEmail(),
                            password: userData.getPassword(),
                            role: role,
                            login_at: userData.getLoginAt(),
                            nama_bank: userData.getAkunBank()?.getNamaBank(),
                            pemilik_rekening: userData.getAkunBank()?.getPemilikRekening(),
                            nomor_rekening: userData.getAkunBank()?.getNomorRekening(),
                        },
                        { transaction: t }
                    );
                });
            } else {
                // Simpan ke users saja (tanpa teachers)
                await this.dbConn.models["user"].create({
                    id: userData.getId(),
                    id_informasi_tambahan: null,
                    nip: userData.getNip(),
                    nama_lengkap: userData.getNamaLengkap(),
                    email: userData.getEmail(),
                    password: userData.getPassword(),
                    role: role,
                    login_at: userData.getLoginAt(),
                    nama_bank: userData.getAkunBank()?.getNamaBank(),
                    pemilik_rekening: userData.getAkunBank()?.getPemilikRekening(),
                    nomor_rekening: userData.getAkunBank()?.getNomorRekening(),
                });
            }
    
            logger.info("✅ User dan teacher (jika perlu) berhasil disimpan.");
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
    

    async getAllGuru(): Promise<GuruProps[]> {
        try {
            console.log("Get all Guru");
            const guru = await this.dbConn.models["teachers"].findAll();
            const guruData = guru.map((guru: any) => {
                const guruData = guru.get ? guru.get() : guru;
                return {
                    nama_lengkap: guruData.nama_lengkap,
                    user_id: guruData.id,
                    nip: guruData.nip
                };
            });
            return guruData;

            const allGuru = await this.dbConn.query(
                `SELECT t.nama_lengkap, u.id, t.nip FROM users u
                INNER JOIN teachers t ON u.id_informasi_tambahan = t.id `,
                {
                    type: QueryTypes.SELECT
                }
            )

            return allGuru.map((guru: any) => {
                return guru as GuruProps;
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
    
    async findByNIP(nip: string): Promise<GuruEntity<GuruProps> | null> {
        try {
            const result = await this.dbConn.query(
                "SELECT * FROM teachers WHERE nip = :nip LIMIT 1",
                {
                    replacements: { nip },
                    type: QueryTypes.SELECT,
                    plain: true,
                }
            );
            return result ? new GuruEntity(result as GuruProps) : null;
        } catch (error) {
            logger.error("Error finding teacher by NIP: ", error);
            throw error;
        }
    }

    async addGuru(guruData: GuruEntity<GuruProps>, userData: UserEntity<UserProps>): Promise<void> {
        try {
            const response = await this.dbConn.transaction(async (t) => { 
                const guru = await this.dbConn.models["teachers"].create(
                    {
                        ...guruData,
                        nama_bank: guruData.getAkunBank()!.getNamaBank(),
                        pemilik_rekening: guruData.getAkunBank()!.getPemilikRekening(),
                        nomor_rekening: guruData.getAkunBank()!.getNomorRekening(),
                    }
                    , { transaction: t });
                await this.dbConn.models["user"].create(
                    {
                        ...userData,
                        id_informasi_tambahan: guru.get("id"),
                    }, { transaction: t });
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async addOrangTua(orangTuaData: OrangTuaEntity<OrangTuaProps>, userData: UserEntity<UserProps>): Promise<void> {
        try {
            const response = await this.dbConn.transaction(async (t) => { 
                const orangTua = await this.dbConn.models["parents"].create(
                    {
                        ...orangTuaData,
                    }
                    , { transaction: t });
                await this.dbConn.models["user"].create(
                    {
                        ...userData,
                        id_informasi_tambahan: orangTua.get("id"),
                    }, { transaction: t });
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async updateUser(userData: UserEntity<UserProps>): Promise<void> {
        try {
            const akunBank = userData.getAkunBank();
    
            const updatedUserData: any = {
                email: userData.getEmail(),
                role: userData.getRole(),
            };
    
            if (akunBank) {
                updatedUserData.nama_bank = akunBank.getNamaBank();
                updatedUserData.pemilik_rekening = akunBank.getPemilikRekening();
                updatedUserData.nomor_rekening = akunBank.getNomorRekening();
            }
    
            await this.dbConn.transaction(async (t) => {
                // Update data di tabel users
                await this.dbConn.models["user"].update(updatedUserData, {
                    where: { id: userData.getId() },
                    transaction: t,
                });
    
                //  Sinkron ke tabel teachers jika punya id_informasi_tambahan
                const idTambahan = userData.getIdInformasiTambahan();
                if (idTambahan) {
                    const updatedTeacherData: any = {
                        jabatan: userData.getRole(),
                    };
    
                    if (userData.getNamaLengkap()) {
                        updatedTeacherData.nama_lengkap = userData.getNamaLengkap();
                    }
    
                    await this.dbConn.models["teachers"].update(updatedTeacherData, {
                        where: { id: idTambahan },
                        transaction: t,
                    });
                }
            });
    
            logger.info("✅Data user & jabatan guru berhasil diperbarui");
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
    
    
    async updateUserLoginTime(
        userId: AggregateId,
        updateTime?: Date,
    ): Promise<void> {
        try {
            await this.dbConn.models["user"].update(
                { login_at: updateTime ?? null },
                { where: { id: userId } },
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async deleteUser(userId: AggregateId): Promise<void> {
        try {
            await this.dbConn.transaction(async (t) => {
                const user = await this.dbConn.models["user"].findByPk(userId);
                const idTambahan = (user as any)?.id_informasi_tambahan;

                // Hapus user
                await this.dbConn.models["user"].destroy({
                    where: { id: userId },
                    transaction: t,
                });

                // Jika ada data tambahan (guru), hapus juga dari teachers
                if (idTambahan) {
                    await this.dbConn.models["teachers"].destroy({
                        where: { id: idTambahan },
                        transaction: t,
                    });
                }
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async isUserIdExist(userId: AggregateId): Promise<UserProps | null> {
        try {
            const user = await this.dbConn.models["user"].findByPk(userId, {
                attributes: { exclude: ["password"] },
            });
            return user as UserProps;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async isUserEmailExist(email: string): Promise<UserProps | null> {
        try {
            const user = await this.dbConn.models["user"].findOne({
                where: { email: email },
            });
            return user as UserProps;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async updatePassword(id: string, hashedPassword: string): Promise<void> {
        try {
            await this.dbConn.models["user"].update(
                { password: hashedPassword },
                { where: { id } }
            );
            logger.info(`Password ${id} berhasil diperbarui`);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}