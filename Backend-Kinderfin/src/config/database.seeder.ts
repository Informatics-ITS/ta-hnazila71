import { Model, Optional, Sequelize } from "sequelize";
import * as bcrypt from "bcrypt";
import { logger } from "../shared/util";
import { GuruProps } from "../module/user/domain/entity";


export interface GuruCreationAttributes extends Optional<GuruProps, 'id'> {}

export class Guru extends Model<GuruProps, GuruCreationAttributes> implements GuruProps {
  public id!: string;
  public nip!: string;
  public jabatan!: string;
  public nama_lengkap!: string;
  public nama_bank!: string;
  public pemilik_rekening!: string;
  public nomor_rekening!: string;

  // Properti tambahan atau metode dapat ditambahkan di sini
}

export const seedDatabase = async (dbConn: Sequelize) => {
    try {
        let password = await bcrypt.hash("Rootpass1!", 10);
        const [admin1, created] = await dbConn.models["teachers"].findOrCreate({
            where: { id: "5a53d571-f85b-4373-8935-bc7eefab74f6" },
            defaults: {
                nip: "010203040506070809",
                nama_lengkap: "Root User",
                jabatan: "Admin",
                nama_bank: "Bank Root",
                pemilik_rekening: "Root",
                nomor_rekening: "1352917209182",
            },
        });
        
        await dbConn.models['user'].findOrCreate({
            where: { id: "4e5508fd-979d-47ad-a56b-e9a604d02f1f" },
            defaults: {
                id_informasi_tambahan: admin1.get("id"),
                email: "rootuser@gmail.com",
                password: password,
                role: "Admin",
            }
        });

        password = await bcrypt.hash("KepalaSekolahpass1!", 10);
        await dbConn.models["user"].findOrCreate({
            where: { id: "4e5508fd-979d-47ad-a56b-e9a604d02f1f" },
            defaults: {
                nip: "010203040506070809",
                nama_lengkap: "Kepala Sekolah",
                email: "kepalasekolah@gmail.com",
                password: password,
                nama_bank: "Bank Root",
                pemilik_rekening: "Root",
                nomor_rekening: "1352917209182",
                role: "Kepala Sekoah",
            },
        });

        password = await bcrypt.hash("Sekretarispass1!", 10);
        await dbConn.models["user"].findOrCreate({
            where: { id: "bca65efd-d928-40c3-afa1-1ff4f2a714f8" },
            defaults: {
                nip: "010203040506070809",
                nama_lengkap: "Sekretaris",
                email: "Sekretaris@gmail.com",
                password: password,
                nama_bank: "Bank Root",
                pemilik_rekening: "Root",
                nomor_rekening: "1352917209182",
                role: "Sekretaris",
            },
        });


        const [orantua1, createdOrantua1] = await dbConn.models['parents'].findOrCreate({
            where: { id: "5a53d571-f85b-4373-8935-bc7eefab74f9" },
            defaults: {
                ayah: "Ayah",
                pekerjaan_ayah: "Pekerjaan Ayah",
                ibu: "Ibu",
                pekerjaan_ibu: "Pekerjaan Ibu",
                alamat: "Alamat",
                no_telepon: "No Telp",
            }
        });

        await dbConn.models["user"].findOrCreate({
            where: { id: "bca65efd-d928-40c3-afa1-1ff4f2a714f8" },
            defaults: {
                id_informasi_tambahan: orantua1.get("id"),
                email: "orangtua@gmail.com",
                password: password,
                role: "Orang Tua",
            }
        });
        





        // password = await bcrypt.hash("KepalaSekolahpass1!", 10);
        // await dbConn.models["user"].findOrCreate({
        //     where: { id: "4e5508fd-979d-47ad-a56b-e9a604d02f1f" },
        //     defaults: {
        //         nip: "010203040506070809",
        //         nama_lengkap: "Kepala Sekolah",
        //         email: "kepalasekolah@gmail.com",
        //         password: password,
        //         nama_bank: "Bank Root",
        //         pemilik_rekening: "Root",
        //         nomor_rekening: "1352917209182",
        //         role: "Kepala Sekoah",
        //     },
        // });

        // password = await bcrypt.hash("Sekretarispass1!", 10);
        // await dbConn.models["user"].findOrCreate({
        //     where: { id: "bca65efd-d928-40c3-afa1-1ff4f2a714f8" },
        //     defaults: {
        //         nip: "010203040506070809",
        //         nama_lengkap: "Sekretaris",
        //         email: "Sekretaris@gmail.com",
        //         password: password,
        //         nama_bank: "Bank Root",
        //         pemilik_rekening: "Root",
        //         nomor_rekening: "1352917209182",
        //         role: "Sekretaris",
        //     },
        // });

        // password = await bcrypt.hash("Gurupass1!", 10);
        // await dbConn.models["user"].findOrCreate({
        //     where: { id: "7b62adde-bac6-4103-8169-5b319dc49941" },
        //     defaults: {
        //         nip: "010203040506070809",
        //         nama_lengkap: "Teknisi",
        //         email: "guru@gmail.com",
        //         password: password,
        //         nama_bank: "Bank Root",
        //         pemilik_rekening: "Root",
        //         nomor_rekening: "1352917209182",
        //         role: "Guru",
        //     },
        // });
        password = await bcrypt.hash("Gurupass1!", 10);
        await dbConn.models["user"].findOrCreate({
            where: { id: "7b62adde-bac6-4103-8169-5b319dc49941" },
            defaults: {
                nip: "010203040506070809",
                nama_lengkap: "Teknisi",
                email: "guru@gmail.com",
                password: password,
                nama_bank: "Bank Root",
                pemilik_rekening: "Root",
                nomor_rekening: "1352917209182",
                role: "Guru",
            },
        });

        password = await bcrypt.hash("Bendaharapass1!", 10);
        await dbConn.models["user"].findOrCreate({
            where: { id: "8b6ffabb-e9bb-4479-b3d1-96ca08ff3075" },
            defaults: {
                nip: "010203040506070809",
                nama_lengkap: "Bendahara",
                email: "Bendahara@gmail.com",
                password: password,
                nama_bank: "Bank Root",
                pemilik_rekening: "Root",
                nomor_rekening: "1352917209182",
                role: "Bendahara",
            },
        });
        
        logger.info("database seeded");
    } catch (error) {
        logger.error(`unable to seed database: ${(error as Error).message}`);
    }
};