import { AggregateId, ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { IDaftarUlangRepository, IDiscountRepository } from "../../domain/repository";
import { IStudentBillsRepository } from "../../domain/repository";

export interface DeleteDiscountCommand {
    id: AggregateId;
}

export class DeleteDiscounCommandHandler
    implements ICommandHandler<DeleteDiscountCommand, void>
{
    constructor(
        private readonly discountRepository: IDiscountRepository,
        private readonly studentBillsRepository: IStudentBillsRepository
    ) {}

    async execute(command: DeleteDiscountCommand): Promise<void> {
        const { id } = command;
      try {
            await this.discountRepository.deleteDiscountById(id);
            await this.studentBillsRepository.setStudentsBillDiscountToNull(id);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}