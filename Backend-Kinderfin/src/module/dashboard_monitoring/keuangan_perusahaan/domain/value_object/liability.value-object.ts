export class Liability {
    private readonly hutang_usaha: number;
    private readonly hutang_bank: number;
    private readonly laba_ditahan: number | null;

    constructor(
        accountsPayable: number,
        bankLoan: number,
        retainedEarning: number | null,
    ) {
        this.hutang_usaha = accountsPayable;
        this.hutang_bank = bankLoan;
        this.laba_ditahan = retainedEarning;
    }

    getHutangUsaha(): number {
        return this.hutang_usaha;
    }

    getHutangBank(): number {
        return this.hutang_bank;
    }

    getLabaDitahan(): number | null {
        return this.laba_ditahan;
    }
}
