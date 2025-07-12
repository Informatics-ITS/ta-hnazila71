import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../shared/abstract";
import { ISalaryQueryHandler } from "../../application/query";
import { SalaryProps } from "../../domain/entity";
import { SalaryStatus } from "../../domain/enum";
import { SalaryQueryHandler } from "../../infrastructure/storage/query";

describe("Testing Salary Query", () => {
    const mockSalaryData: SalaryProps[] = [
        {
            id: "78365f59-680e-43ec-a793-4f0cbc7801ee",
            nama_lengkap: "Test User Front Office",
            tanggal_pembayaran: new Date("2023-10-14"),
            nominal: 1800000,
            user_id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
            status_pembayaran: SalaryStatus.PAID,
        },
        {
            id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
            nama_lengkap: "Test User Administrator Keuangan",
            tanggal_pembayaran: new Date("2023-10-14"),
            nominal: 2000000,
            user_id: "3679285c-707c-42ed-9c6e-9984825b22fd",
            status_pembayaran: SalaryStatus.PAID,
        },
    ];

    const mockSalaryDataOwn: SalaryProps[] = [
        {
            id: "78365f59-680e-43ec-a793-4f0cbc7801ee",
            nama_lengkap: "Test User Front Office",
            tanggal_pembayaran: new Date("2023-10-14"),
            nominal: 1800000,
            user_id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
            status_pembayaran: SalaryStatus.PAID,
        },
    ];

    const mockData = {
        findAll: jest.fn().mockReturnValue(mockSalaryData),
        findAllOwn: jest.fn().mockReturnValue(mockSalaryDataOwn),
        findAllError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockedDatabase: Sequelize;
    let salaryQueryHandler: ISalaryQueryHandler;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.models.gaji = {
            findAll: mockData.findAll,
        } as any;
        salaryQueryHandler = new SalaryQueryHandler(mockedDatabase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Get All Salaries", () => {
        it("should success return all salary datas with high-level role", async () => {
            const salaries = await salaryQueryHandler.getAllSalaries({});

            expect(mockedDatabase.models.gaji.findAll).toHaveBeenCalled();
            expect(salaries).toEqual(mockSalaryData);
        });

        it("should success return all salary datas with low-level role", async () => {
            mockedDatabase.models.gaji.findAll = mockData.findAllOwn;

            const salaries = await salaryQueryHandler.getAllSalaries({});

            expect(mockedDatabase.models.gaji.findAll).toHaveBeenCalled();
            expect(salaries).toEqual(mockSalaryDataOwn);
        });

        it("should error return all salary datas", async () => {
            mockedDatabase.models.gaji.findAll = mockData.findAllError;

            try {
                await salaryQueryHandler.getAllSalaries({});
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.models.gaji.findAll).toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
