import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus, logger } from "../../../../shared/util";
import { DokumenEntity, DokumenProps, SiswaEntity, SiswaProps } from "../../domain/entity";
import { Gender } from "../../domain/enum/gender.enum";
import { IPasswordService } from "../../../user/domain/service";
import { ISiswaRepository } from "../../domain/repository/siswa.repository";

export interface AddSiswaCommand { 
  id_orang_tua: string;
  nama_lengkap: string;
  tanggal_lahir: Date;
  alamat: string
  jenis_kelamin: Gender;
  // status: string;
  // grade: string;
  akta_kelahiran: string;
  kartu_keluarga: string;
}

export class AddSiswaCommandHandler 
  implements ICommandHandler<AddSiswaCommand, void>
{
  constructor(
    private readonly siswaRepository: ISiswaRepository,
  ) {
  }

  async execute(command: AddSiswaCommand): Promise<void> {
    const { akta_kelahiran, kartu_keluarga } = command;
    try {
      const dokumenData = new DokumenEntity<DokumenProps>({
        url_akta_kelahiran: akta_kelahiran,
        url_kartu_keluarga: kartu_keluarga,
      });
      const siswaData = new SiswaEntity<SiswaProps>({
        id_orang_tua: command.id_orang_tua,
        nama_lengkap: command.nama_lengkap,
        tanggal_lahir: command.tanggal_lahir,
        alamat: command.alamat,
        jenis_kelamin: command.jenis_kelamin,
      });
      await this.siswaRepository.addSiswa(dokumenData, siswaData);
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}