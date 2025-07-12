import { Sequelize, where } from "sequelize";
import {
    AggregateId,
    ApplicationError,
    DefaultMessage,
} from "../../../../../shared/abstract";
import { PPDBEntity, PPDBProps } from "../../../domain/entity";
import { IPPDBRepository } from "../../../domain/repository";
import { SiswaProps } from "../../../../siswa/domain/entity";
import { v4 as uuidv4 } from "uuid";

export class PPDBRepository implements IPPDBRepository {
    constructor(private readonly dbConn: Sequelize) {}

    async addPPDB(ppdbData: PPDBEntity<PPDBProps>): Promise<void> {
        console.log("Adding PPDB...", ppdbData);
        try {
            const newPPDB = await this.dbConn.transaction(async (t) => {
                const ppdbRecord = await this.dbConn.models["ppdb"].create(
                    {
                        ...(ppdbData as any),
                    },
                    { transaction: t },
                );
                const ppdbId = ppdbRecord.getDataValue("id");
                return ppdbId;
            });
            return newPPDB;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async updatePPDB(id: string, ppdbData: PPDBEntity<PPDBProps>): Promise<void> {
        try {
          await this.dbConn.transaction(async (t) => {
            await this.dbConn.models["ppdb"].update(
              {
                ...(ppdbData as any),
              },
              {
                where: {
                  id: id,
                },
                transaction: t,
              },
            );
          });
        } catch (error) {
          const appErr = error as ApplicationError;
          throw new ApplicationError(appErr.code, appErr.message);
        }
    }
    
    async verifPPDBData(id: string): Promise<SiswaProps> {
        try {
            const ppdb = await this.dbConn.models["ppdb"].findOne({
                where: {
                    id: id
                }
            }) as PPDBProps;

            if (!ppdb) {
                throw new ApplicationError(404, "Data PPDB tidak ditemukan");
            }

            if (ppdb.is_verified === "Terverifikasi") {
                throw new ApplicationError(404, "Siswa Sudah Terdaftar");
            }

            const siswaID: AggregateId = uuidv4();
            const docId: AggregateId = uuidv4();

            await this.dbConn.transaction(async (t) => {
                const responseDocument = await this.dbConn.models["documents"].create({
                    id: docId,
                    url_akta_kelahiran: ppdb.url_file_akta,
                    url_kartu_keluarga: ppdb.url_file_kk,
                    ppdb_id: id,
                }, { transaction: t }
                );

                const responseStudent = await this.dbConn.models["students"].create({
                    id: siswaID,
                    nama_lengkap: ppdb.nama_lengkap,
                    tanggal_lahir: ppdb.tanggal_lahir,
                    alamat: ppdb.alamat,
                    jenis_kelaminn: ppdb.jenis_kelamin,
                    status: ppdb.status,
                    grade: ppdb.kelas,
                    id_dokumen: docId,
                    id_orang_tua: ppdb.user_id,
                    id_ppdb: id
                }, { transaction: t }
                );

                const updatePPDB = await this.dbConn.models["ppdb"].update({
                    is_verified: "Terverifikasi",
                }, { where: { id: id } })
                
                if (!updatePPDB) {
                    throw new ApplicationError(404, "Gagal melakukan update");
                }
            });

            const siswa = await this.dbConn.models["students"].findOne({
                where: {
                    id: siswaID,
                }
            }) as SiswaProps ;

            if (!siswa) {
                throw new ApplicationError(404, "Data Siswa tidak ditemukan");
            }

            return siswa;

        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async rejectPPDBData(id: string): Promise<PPDBProps> {
        try {
            // Ambil data PPDB berdasarkan ID
            const ppdb = await this.dbConn.models["ppdb"].findOne({
                where: {
                    id: id
                }
            }) as PPDBProps;
    
            // Jika data PPDB tidak ditemukan, lempar error
            if (!ppdb) {
                throw new ApplicationError(404, "Data PPDB tidak ditemukan");
            }
            console.log("PPDB Data:", ppdb);
            await this.dbConn.transaction(async (t) => {
                const updatePPDB = await this.dbConn.models["ppdb"].update({
                    is_verified: "Ditolak",
                }, { 
                    where: { id: id },
                    transaction: t 
                });
                console.log("Update Result:", updatePPDB);
            });
            return ppdb;
    
        } catch (error) {
            // Tangani error yang terjadi, dan lempar kembali ApplicationError
            const appErr = error as ApplicationError;
            console.error("Error during rejectPPDBData:", appErr); // Logging error untuk debugging
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async getAllPPDB(): Promise<PPDBProps[]> {
        try {
          console.log("Get all PPDB FJDSLKFJDASLKFJD");
          const ppdbs = await this.dbConn.models["ppdb"].findAll();
          const ppdbDatas = ppdbs.map((ppdb: any) => {
            const ppdbData = ppdb.get ? ppdb.get() : ppdb;
            return {
              ...ppdbData,
            };
          }
          );
          return ppdbDatas;
        } catch (error) {
          const appErr = error as ApplicationError;
          throw new ApplicationError(appErr.code, appErr.message);
        } 
    }

    async findById(id: string): Promise<PPDBProps> {
        try {
            const ppdbRecord = await this.dbConn.models["ppdb"].findOne({
                where: { id },
                raw: true,
            });
    
            if (!ppdbRecord) {
                throw new ApplicationError(404, DefaultMessage.ERR_ADD);
            }
    
            return ppdbRecord as PPDBProps;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async getPPDBByID(id: AggregateId): Promise<PPDBProps> {
        try {
            const ppdb = await this.dbConn.models["ppdb"].findOne({
                where: {
                    id,
                },
            });

            if (!ppdb) {
                throw new ApplicationError(404, "PPDB not found");
            }

            return ppdb as PPDBProps;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async getPPDBByUserID(user_id: string): Promise<PPDBProps[]> {
        try {
            const ppdb = await this.dbConn.models["ppdb"].findAll({
                where: {
                    user_id,
                },
            });
            if (!ppdb) {
                throw new ApplicationError(400, "PPDB not found");
            }

            const ppdbData = ppdb.map((ppdb: any) => {
                const ppdbData = ppdb.get ? ppdb.get() : ppdb;
                return {
                    ...ppdbData,
                };
            });

            return ppdbData;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
    async getPPDBByTahunAjaran(tahun_ajaran: string): Promise<PPDBProps[]> {
        try {
            const ppdb = await this.dbConn.models["ppdb"].findAll({
                where: {
                    tahun_ajaran,
                },
            });
            if (!ppdb) {
                throw new ApplicationError(400, "PPDB not found");
            }

            const ppdbData = ppdb.map((ppdb: any) => {
                const ppdbData = ppdb.get ? ppdb.get() : ppdb;
                return {
                    ...ppdbData,
                };
            });

            return ppdbData;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async deletePPDB(id: AggregateId): Promise<void> {
        try {
            await this.dbConn.transaction(async (t) => {
                await this.dbConn.models["ppdb"].destroy({
                    where: {
                        id,
                    },
                    transaction: t,
                });
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
    
    // async updatePPDB(id: string, ppdbData: PPDBEntity<PPDBProps>): Promise<void> {
    //   try {
    //     console.log("ppdbData di updatePPDB:", ppdbData);
    //     await this.dbConn.transaction(async (t) => {
    //       await this.dbConn.models["ppdb"].update(
    //         {
    //           ...ppdbData,
    //         },
    //         {
    //           where: {
    //             id: id,
    //           },
    //           transaction: t,
    //         },
    //       );
    //       // console.log("PPDB is verified", ppdbData.getIs_verified());
    //       // console.log("PPDB is verified", ppdbData.is_verified);
    //     });
    //   } catch (error) {
    //     const appErr = error as ApplicationError;
    //     throw new ApplicationError(appErr.code, appErr.message);
    //   }
    // }

    
    // async updatePPDB(id: string, ppdbDataProps: PPDBProps): Promise<void> {
    //     const ppdbData = new PPDBEntity(ppdbDataProps); // Create a new instance of PPDBEntity
    //     try {
    //         await this.dbConn.transaction(async (t) => {
    //             await this.dbConn.models["ppdb"].update(
    //                 {
    //                     ...(ppdbData as any),
    //                     id: undefined,
    //                 },
    //                 {
    //                     where: {
    //                         id: id,
    //                     },
    //                     transaction: t,
    //                 },
    //             );
    //             console.log("Data yang dirubah", ppdbData);
    //             if (ppdbData.getIs_verified() === "Terverifikasi") {
    //                 const ppdbRecord = await this.dbConn.models["ppdb"].findOne(
    //                     {
    //                         where: {
    //                             id,
    //                         },
    //                         transaction: t,
    //                         raw: false,
    //                     },
    //                 );
    //                 if (!ppdbRecord) {
    //                     throw new ApplicationError(404, DefaultMessage.ERR_ADD);
    //                 }
    //                 // console.log("hah", ppdbRecord.get("user_id"));

    //                 const userRecord = await this.dbConn.models["user"].findOne(
    //                     {
    //                         where: {
    //                             id: ppdbRecord.get("user_id"),
    //                         },
    //                         transaction: t,
    //                         raw: false,
    //                     },
    //                 );

    //                 if (!userRecord) {
    //                     throw new ApplicationError(404, DefaultMessage.ERR_ADD);
    //                 }

    //                 const documentRecord = await this.dbConn.models[
    //                     "documents"
    //                 ].findOne({
    //                     where: {
    //                         ppdb_id: ppdbRecord.get("id"),
    //                     },
    //                     transaction: t,
    //                     raw: false,
    //                 });

    //                 if (!documentRecord) {
    //                     throw new ApplicationError(404, DefaultMessage.ERR_ADD);
    //                 }
    //                 // console.log("User Record", userRecord);
    //                 // console.log("PPDB Record", ppdbRecord.get());
    //                 // console.log("Document Record", documentRecord.get());
    //                 // console.log("User Informasi Tambahan (ID Parents)", userRecord.get("id_informasi_tambahan"));
    //                 // console.log("PPDB Status", ppdbRecord.get("status"));
    //                 // console.log("Document_id", documentRecord.get("id"));
    //                 await this.dbConn.models["students"].create(
    //                     {
    //                         ...ppdbRecord.get(),
    //                         status: ppdbRecord.get("status"),
    //                         grade: ppdbRecord.get("kelas"),
    //                         id_dokumen: documentRecord.get("id"),
    //                         id_orang_tua: userRecord.get("id"),
    //                         id_ppdb: ppdbRecord.get("id"),
    //                     },
    //                     { transaction: t },
    //                 );
    //             } else {
    //                 console.log("PPDB is not verified");
    //             }
    //         });
    //         // console.log("PPDB Data", ppdbData);
    //     } catch (error) {
    //         const appErr = error as ApplicationError;
    //         throw new ApplicationError(appErr.code, appErr.message);
    //     }
    // }
}