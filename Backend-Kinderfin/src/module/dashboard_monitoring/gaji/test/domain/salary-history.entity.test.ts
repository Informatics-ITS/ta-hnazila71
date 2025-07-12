import { SalaryHistoryEntity, SalaryHistoryProps } from "../../domain/entity";
import { SalaryStatus } from "../../domain/enum";

describe("Testing Salary History Entity", () => {
    const mockSalaryHistory: SalaryHistoryProps = {
        nama_lengkap: "Test User",
        tanggal_pembayaran: new Date("2023-10-14"),
        nominal: 2000000,
        status_pembayaran: SalaryStatus.PAID,
    };

    describe("Constructor New Salary History Entity", () => {
        it("should success match new salary history entity", async () => {
            const newSalaryHistory =
                new SalaryHistoryEntity<SalaryHistoryProps>(mockSalaryHistory);

            expect(newSalaryHistory.getNamaLengkap()).toEqual(
                mockSalaryHistory.nama_lengkap,
            );
            expect(newSalaryHistory.getTanggalPembayaran()).toEqual(
                mockSalaryHistory.tanggal_pembayaran,
            );
            expect(newSalaryHistory.getNominal()).toEqual(
                mockSalaryHistory.nominal,
            );
            expect(newSalaryHistory.getStatusPembayaran()).toEqual(
                mockSalaryHistory.status_pembayaran,
            );
        });

        it("should success match unpaid salary on new salary history entity", async () => {
            mockSalaryHistory.status_pembayaran = SalaryStatus.PENDING;

            const newSalaryHistory =
                new SalaryHistoryEntity<SalaryHistoryProps>(mockSalaryHistory);

            expect(newSalaryHistory.id).toEqual("");
            expect(newSalaryHistory.getNamaLengkap()).toEqual(
                mockSalaryHistory.nama_lengkap,
            );
            expect(newSalaryHistory.getTanggalPembayaran()).toEqual(
                mockSalaryHistory.tanggal_pembayaran,
            );
            expect(newSalaryHistory.getNominal()).toEqual(
                mockSalaryHistory.nominal,
            );
            expect(newSalaryHistory.getStatusPembayaran()).toEqual(
                mockSalaryHistory.status_pembayaran,
            );
        });
    });
});
