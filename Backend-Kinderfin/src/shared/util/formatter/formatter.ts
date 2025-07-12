export const MasterDataTypeFormatter = (type: string) => {
    return type
        .split("-")
        .map((str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase())
        .join(" ");
};

// create formatter for student bill id
export const StudentBillStatusFormatter = (status: string) => {
    return status
        .split("_")
        .map((str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase())
        .join(" ");
};

export const PaymentTypeConstraintFormatter = (
    constraint: string,
): string[] => {
    const fieldConstraint = constraint.toLowerCase().split(",");
    const fieldResult: string[] = [];
    for (const field of fieldConstraint) {
        fieldResult.push(field.trim().split(" ").join("_"));
    }
    return fieldResult;
};
