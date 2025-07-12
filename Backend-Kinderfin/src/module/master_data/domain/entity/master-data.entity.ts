import { AggregateId, AggregateRoot } from "../../../../shared/abstract";

export interface MasterDataProps {
    id?: AggregateId;
    tipe: string;
    nilai?: string;
    aturan?: string;
    deskripsi?: string;
}

export class MasterDataEntity<
    TProps extends MasterDataProps,
> extends AggregateRoot {
    private tipe: string;
    private nilai?: string;
    private aturan?: string;
    private deskripsi?: string;

    constructor(props: TProps) {
        super(props.id);
        this.tipe = props.tipe;
        ({
            nilai: this.nilai,
            aturan: this.aturan,
            deskripsi: this.deskripsi,
        } = props);
    }

    getTipe(): string {
        return this.tipe;
    }

    getNilai(): string | undefined {
        return this.nilai;
    }

    getAturan(): string | undefined {
        return this.aturan;
    }

    getDeskripsi(): string | undefined {
        return this.deskripsi;
    }
}
