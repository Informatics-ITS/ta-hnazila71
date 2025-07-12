import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError } from "../../../../shared/abstract";

const imagekitConfig = appConfig.get("/imagekit");
const imagekitUrlEndpoint: RegExp = new RegExp(
    `\\b${imagekitConfig.urlEndpoint}\\w*`,
);

const ErrorInvalidUrlEndpoint = "URL Endpoint tidak valid";

export interface PaymentFileProps {
    id: string;
    nama: string;
    url_asli: string;
    path: string;
}

export class PaymentFileEntity<TProps extends PaymentFileProps> {
    private id: string;
    private nama: string;
    private url_asli: string;
    private path: string;

    constructor(props: TProps) {
        this.id = props.id;
        this.nama = props.nama;
        this.url_asli = props.url_asli;
        this.path = props.path;
        this.validateFile();
    }

    getId(): string {
        return this.id;
    }

    getNama(): string {
        return this.nama;
    }

    getUrlAsli(): string {
        return this.url_asli;
    }

    getPath(): string {
        return this.path;
    }

    validateFile() {
        if (!imagekitUrlEndpoint.test(this.url_asli)) {
            throw new ApplicationError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                ErrorInvalidUrlEndpoint,
            );
        }
    }
}
