import { AggregateId, ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { IDaftarUlangRepository, IDiscountRepository, ISPPRepository } from "../../domain/repository";
import { IStudentBillsRepository } from "../../domain/repository";

export interface DeleteSPPCommand {
    id: AggregateId;
}

export class DeleteSPPCommandHandler
    implements ICommandHandler<DeleteSPPCommand, void>
{
    constructor(
        private readonly sppRepository: ISPPRepository,
        private readonly studentBillsRepository: IStudentBillsRepository
    ) {}

    async execute(command: DeleteSPPCommand): Promise<void> {
        const { id } = command;
      try {
            await this.sppRepository.deleteSPPById(id);
            await this.studentBillsRepository.setStudentBillIDTagihansToNull(id);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}