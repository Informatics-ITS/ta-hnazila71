import { AggregateId, ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { IDaftarUlangRepository } from "../../domain/repository";
import { IStudentBillsRepository } from "../../domain/repository";

export interface DeleteDaftarUlangCommand {
    id: AggregateId;
}

export class DeleteDaftarUlangCommandHandler
    implements ICommandHandler<DeleteDaftarUlangCommand, void>
{
    constructor(
        private readonly daftarUlangRepository: IDaftarUlangRepository,
        private readonly studentBillsRepository: IStudentBillsRepository
    ) {}

    async execute(command: DeleteDaftarUlangCommand): Promise<void> {
        const { id } = command;
        try {
            await this.daftarUlangRepository.deleteDaftarUlang(id);
            await this.studentBillsRepository.setStudentBillIDTagihansToNull(id);
            // await this.studentBillsRepository.deleteStudentBillsByDaftarUlangId(id);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}