import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import { SPPProps, SPPEntity } from "../../domain/entity";
import { ISPPRepository } from "../../domain/repository";

export interface AddSPPBillCommand {
  nama: string;
  biaya_spp: number;
  biaya_komite: number;
  biaya_ekstrakulikuler: number;
  bulan: string;
  tahun_ajaran: string;
  due_date: Date;
}

export class AddSPPBillCommandHandler
  implements ICommandHandler<AddSPPBillCommand, string>
{
  constructor(
    private readonly sppRepository: ISPPRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AddSPPBillCommand): Promise<string> {
    try {
      const total_amount = command.biaya_spp + command.biaya_komite + command.biaya_ekstrakulikuler;
      const newSPP = new SPPEntity<SPPProps>({
        ...command,
        total_amount,
      } as SPPProps);
      const spp_bill_id = await this.sppRepository.addSPPBill(newSPP);
      return spp_bill_id;
      // also add to student's bill
    } catch (error) {
      const appEr = error as ApplicationError;
      throw new ApplicationError(appEr.code, appEr.message);
    }
  }
}