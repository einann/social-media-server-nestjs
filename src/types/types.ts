export type GetFilterType = {
    values: object | 'GETALL';
    orderBy?: [string, string] | undefined;
    globalGroup?: 'AND' | 'OR';
    skip?: string | number;
    take?: string | number;
    dto?: string;
    [key: string]: string | object | number;
}

export type FormattedDateType = {
    fullDate: string,
    fullTime: string,
}

export type OperationsType = "==" | "!=" | "<<" | "<=" | ">>" | ">=" | "%" | "%=" | "=%";

export type InnerFilterType = {
    field: string,
    operation: OperationsType,
    value: string,
    group: "AND" | "OR",
    dto: string,
}

export type JoinObjectType = {
    sourceField: string,
    targetTable: string,
    condition: string,
}