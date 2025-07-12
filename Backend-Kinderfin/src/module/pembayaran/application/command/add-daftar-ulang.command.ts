import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { DaftarUlangEntity, DaftarUlangProps } from "../../domain/entity";
import { IDaftarUlangRepository } from "../../domain/repository";
import { EventBus } from "../../../../shared/util";

export interface AddDaftarUlangCommand {
    nama: string;
    biaya_perlengkapan: number;
    biaya_kegiatan: number;
    semester: string;
    tahun_ajaran: string;
    due_date: Date;
}

export class AddDaftarUlangCommandHandler
    implements ICommandHandler<AddDaftarUlangCommand, string>
{
    constructor(
        private readonly daftarUlangRepository: IDaftarUlangRepository,
        private readonly eventBus: EventBus,
    ) {}

    async execute(command: AddDaftarUlangCommand): Promise<string> {
        try {
            const total_amount =
                command.biaya_perlengkapan + command.biaya_kegiatan;
            const newDaftarUlang = new DaftarUlangEntity<DaftarUlangProps>({
                ...command,
                total_amount,
            } as DaftarUlangProps);
            const daftar_ulang_id =
                await this.daftarUlangRepository.addDaftarUlang(newDaftarUlang);
            return daftar_ulang_id;
        } catch (error: unknown) {
            const appEr = error as ApplicationError;
            throw new ApplicationError(appEr.code, appEr.message);
        }
    }
}
