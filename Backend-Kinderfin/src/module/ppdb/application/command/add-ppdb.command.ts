import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { PPDBEntity, PPDBProps } from "../../domain/entity";
import { IPPDBRepository } from "../../domain/repository";

export interface AddPPDBCommand {
  user_id: string;
  nama_lengkap: string;
  tanggal_lahir: Date;
  jenis_kelamin: string;
  alamat: string;
  kelas: string;
  url_file_akta: string;
  url_file_kk: string;
  status: string;
  tahun_ajaran: string;
}

export class AddPPDBCommandHandler
  implements ICommandHandler<AddPPDBCommand, void>
{
  constructor(
    private readonly ppdbRepository: IPPDBRepository,
  ) {
  }

  async execute(command: AddPPDBCommand): Promise<void> {
    const {
      user_id,
      nama_lengkap,
      tanggal_lahir,
      jenis_kelamin,
      alamat,
      kelas,
      url_file_akta,
      url_file_kk,
      status,
      tahun_ajaran,
    } = command;
    try {
      const ppdbData = new PPDBEntity<PPDBProps>({
        user_id,
        nama_lengkap,
        tanggal_lahir,
        jenis_kelamin,
        alamat,
        kelas,
        url_file_akta,
        url_file_kk,
        status,
        tahun_ajaran
      });
      const ppdbId = await this.ppdbRepository.addPPDB(ppdbData);
      console.log("PPDB ID di add ppdb command", ppdbId);
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}