import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../shared/abstract";
import { SalaryEntity, SalaryProps } from "../../domain/entity";
import { SalaryStatus } from "../../domain/enum";

describe("Testing Salary Entity", () => {
    const mockSalary: SalaryProps = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        nama_lengkap: "Test User",
        tanggal_pembayaran: new Date("2023-10-14"),
        nominal: 2000000,
        status_pembayaran: SalaryStatus.PAID,
        user_id: "3679285c-707c-42ed-9c6e-9984825b22fd",
    };

    describe("Constructor New Salary Entity", () => {
        it("should success match new salary entity", async () => {
            const newSalary = new SalaryEntity<SalaryProps>(mockSalary);

            expect(newSalary.id).toEqual(mockSalary.id);
            expect(newSalary.getNamaLengkap()).toEqual(mockSalary.nama_lengkap);
            expect(newSalary.getTanggalPembayaran()).toEqual(
                mockSalary.tanggal_pembayaran,
            );
            expect(newSalary.getNominal()).toEqual(mockSalary.nominal);
            expect(newSalary.getStatusPembayaran()).toEqual(
                mockSalary.status_pembayaran,
            );
            expect(newSalary.getUserId()).toEqual(mockSalary.user_id);
        });

        it("should error match wrong amount on new salary entity", async () => {
            mockSalary.nominal = -1;

            try {
                new SalaryEntity<SalaryProps>(mockSalary);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Nominal gaji tidak boleh bernilai negatif",
                );
            }
        });

        it("should error match wrong full name on new salary entity", async () => {
            mockSalary.nama_lengkap = "Test User 1";

            try {
                new SalaryEntity<SalaryProps>(mockSalary);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Nama lengkap hanya dapat berisi huruf, koma, titik, atau spasi",
                );
            }
        });
    });
});
