export class FinancialStatictic {
    private readonly bulan: number;
    private readonly total: number;

    constructor(
        month: number,
        amount: number,
    ) {
        this.bulan = month;
        this.total = amount;
    }
}
