import { SalaryHistoryEntity, SalaryHistoryProps } from "../../domain/entity";
import { SalaryStatus } from "../../domain/enum";
import {
    ISalaryFilterService,
    SalaryFilterService,
} from "../../domain/service";

describe("Testing Filter Salary History Service", () => {
    const salaryData: SalaryHistoryProps[] = [
        {
            nama_lengkap: "Test User A",
            tanggal_pembayaran: new Date("2023-10-13"),
            nominal: 1800000,
            status_pembayaran: SalaryStatus.PAID,
        },
        {
            nama_lengkap: "Test User B",
            tanggal_pembayaran: new Date("2023-10-14"),
            nominal: 2000000,
            status_pembayaran: SalaryStatus.PENDING,
        },
    ];

    const salaryDataResult = [
        new SalaryHistoryEntity<SalaryHistoryProps>({
            nama_lengkap: "Test User A",
            tanggal_pembayaran: new Date("2023-10-13"),
            nominal: 1800000,
            status_pembayaran: SalaryStatus.PAID,
        }),
    ].map(({ id, ...rest }) => rest);

    let salaryFilterService: ISalaryFilterService;

    beforeEach(() => {
        jest.clearAllMocks();
        salaryFilterService = new SalaryFilterService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Filter Salary History", () => {
        it("should success return filtered salary history", async () => {
            const filteredSalaries = await salaryFilterService.filterSalaryPaid(
                salaryData,
            );

            expect(filteredSalaries.map(({ id, ...rest }) => rest)).toEqual(salaryDataResult);
        });
    });
});
