import { UserRole } from "../enum";

export interface ISalaryAccessService {
    filterSalaryAccess(userId: string, role: string): object;
}

// export class SalaryAccessService implements ISalaryAccessService {
//     filterSalaryAccess(userId: string, role: string): object {
//         return role == UserRole.MANAGER ||
//             role == UserRole.FINANCE_ADMIN ||
//             role == UserRole.SECRETARY
//             ? {}
//             : { id_user: userId };
//     }
// }

export class SalaryAccessService implements ISalaryAccessService {
    filterSalaryAccess(userId: string, role: string): object {
        return role == UserRole.KEPALA_SEKOLAH ||
            role == UserRole.SEKRETARIS ||
            role == UserRole.BENDAHARA
            ? {}
            : { id_user: userId };
    }
}