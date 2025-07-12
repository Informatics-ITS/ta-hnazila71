import { UserRole } from "../../domain/enum";
import {
    ISalaryAccessService,
    SalaryAccessService,
} from "../../domain/service";

describe("Testing Salary Access Service", () => {
    const [userId, roleAdmin, roleNonAdmin] = [
        "3679285c-707c-42ed-9c6e-9984825b22fd",
        UserRole.FINANCE_ADMIN,
        UserRole.EDUCATOR,
    ];

    let salaryAccessService: ISalaryAccessService;

    beforeEach(() => {
        jest.clearAllMocks();
        salaryAccessService = new SalaryAccessService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Filter Salary Access", () => {
        it("should success return all salary access", async () => {
            const result = await salaryAccessService.filterSalaryAccess(
                userId,
                roleAdmin,
            );

            expect(result).toEqual({});
        });

        it("should success return certain salary access", async () => {
            const result = await salaryAccessService.filterSalaryAccess(
                userId,
                roleNonAdmin,
            );

            expect(result).toEqual({ id_user: userId });
        });
    });
});
