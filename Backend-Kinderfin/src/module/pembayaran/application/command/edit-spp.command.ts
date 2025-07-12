import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { DiscountProps, DiscountEntity } from "../../domain/entity/discount.entity";
import { IDiscountRepository } from "../../domain/repository/discount.repository";
import { ISPPRepository, IStudentBillsRepository } from "../../domain/repository";
import { SPPEntity, SPPProps } from "../../domain/entity";

export interface EditSPPCommand {
  id: string;
  nama: string;
  biaya_spp: number;
  biaya_komite: number;
  biaya_ekstrakulikuler: number;
  total_amount: number;
  bulan: string;
  tahun_ajaran: string;
  due_date: Date;
}

export class EditSPPCommandHandler
  implements ICommandHandler<EditSPPCommand, void>
{
  constructor(
    private readonly sppRepository: ISPPRepository,
    private readonly studentBillRepository: IStudentBillsRepository,
  ) {}

  async execute(command: EditSPPCommand): Promise<void> {
    try {
      const total_amount = command.biaya_spp + command.biaya_komite + command.biaya_ekstrakulikuler;

      const spp = await this.sppRepository.getSPPBillById(command.id);
      if (!spp) {
        throw new ApplicationError(
          StatusCodes.NOT_FOUND,
          "Data SPP Not Found",
        );
      }

      const newSPP = new SPPEntity<SPPProps>({
        ...command,
        total_amount,
      } as SPPProps);
    
      await this.sppRepository.editSPPBillById(command.id, newSPP);
      // get new total amount
      // await this.studentBillRepository.setStudentBillIDTagihansToNull(command.id);
      await this.studentBillRepository.updateStudentBillTotalAmount(command.id, total_amount);
    } catch (error) {
      const appEr = error as ApplicationError;
      throw new ApplicationError(appEr.code, appEr.message);
    }
  }
}