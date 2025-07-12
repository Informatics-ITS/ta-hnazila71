import { AggregateId } from "../../../../shared/abstract";

export interface ITokenService {
    generateToken(
        userId: AggregateId,
        name: string,
        role: string,
        idInformasiTambahan: string,
    ): Promise<string>;
}
