import jwt from "jsonwebtoken";
import { appConfig } from "../../../../config";
import { AggregateId } from "../../../../shared/abstract";
import { ITokenService } from "../../application/service";
const token = appConfig.get("/token");

export class TokenService implements ITokenService {
    async generateToken(
        userId: AggregateId,
        name: string,
        role: string,
        idInformasiTambahan: string, 
    ): Promise<string> {
        return jwt.sign(
            { 
                id_user: userId, 
                nama: name, 
                role: role,
                id_informasi_tambahan: idInformasiTambahan, 
            },
            token.secretKey,
            {
                expiresIn: "4h",
                issuer: token.issuer,
            },
        );
    }
}
