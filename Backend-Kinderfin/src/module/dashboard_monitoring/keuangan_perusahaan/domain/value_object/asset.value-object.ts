export class Asset {
    private readonly kas: number;
    private readonly piutang_usaha: number;
    private readonly inventaris: number;
    private readonly penyusutan_inventaris: number;
    private readonly pendapatan_yang_belum_diterima: number | null;

    constructor(
        cash: number,
        accountsReceivable: number,
        inventory: number,
        inventoryShrinkage: number,
        accruedRevenue: number | null,
    ) {
        this.kas = cash;
        this.piutang_usaha = accountsReceivable;
        this.inventaris = inventory;
        this.penyusutan_inventaris = inventoryShrinkage;
        this.pendapatan_yang_belum_diterima = accruedRevenue;
    }

    getKas(): number {
        return this.kas;
    }

    getPiutangUsaha(): number {
        return this.piutang_usaha;
    }

    getInventaris(): number {
        return this.inventaris;
    }

    getPenyusutanInventaris(): number {
        return this.penyusutan_inventaris;
    }

    getPendapatanBelumDiterima(): number | null {
        return this.pendapatan_yang_belum_diterima;
    }
}
