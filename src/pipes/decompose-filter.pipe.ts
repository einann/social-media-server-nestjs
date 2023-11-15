import { BadRequestException, PipeTransform } from "@nestjs/common";
import { InnerFilterType } from "src/types/types";

const operationTransforms = {
    "==": "=",
    "!=": "<>",
    "%": "LIKE",
    "%=": "LIKE",
    "=%": "LIKE",
};

export class DecomposeFilterPipe implements PipeTransform {
    transform(value: any) {
        if (value.filter === "GETALL") return {
            values: value.filter,
            orderBy: value.orderBy || [],
            skip: value.skip || 0,
            take: value.take || 10,
            dto: value.dto || "",
        };

        else if (typeof value !== "object") throw new BadRequestException();

        else if (!Object.keys(value).includes("filters")) throw new BadRequestException();

        else if (value.filters.length === 0) throw new BadRequestException();

        else if (
            !value.filters.every(x => Object.keys(x).includes('field'))
            || !value.filters.every(x => Object.keys(x).includes('operation'))
            || !value.filters.every(x => Object.keys(x).includes('value'))
        ) {
            throw new BadRequestException();
        }

        else {
            const decFilter = {
                globalGroup: value.group,
                values: {},
                orderBy: value.orderBy || [],
                skip: value.skip || 0,
                take: value.take || 10,
                dto: value.dto || "",
            };
            value.filters.forEach((filter: InnerFilterType) => {
                const splitValues = filter.value.split(",");
                const transformedOperation = operationTransforms[filter.operation];
                // Sinlge value sent in a single filter
                if (splitValues.length == 1) {
                    const query = { query: `.${filter.field} ${transformedOperation ? transformedOperation : filter.operation} :${filter.field}` };
                    if (Object.keys(decFilter).includes(filter.group)) {
                        decFilter[filter.group].push(query)
                    }
                    else {
                        decFilter[filter.group] = [{ query: `.${filter.field} ${transformedOperation ? transformedOperation : filter.operation} :${filter.field}` }];
                    }
                    decFilter.values[filter.field] = this.getQueryValueOperation(filter.operation, filter.value);
                }
                // Multiple values sent in a single filter (seperated by comma)
                else if (splitValues.length > 1) {
                    const query = { query: `.${filter.field} IN (:...${filter.field})` };
                    if (Object.keys(decFilter).includes(filter.group)) {
                        decFilter[filter.group].push(query)
                    }
                    else {
                        decFilter[filter.group] = [query];
                    }
                    decFilter.values[filter.field] = splitValues;
                }
            });

            return decFilter;
        }
    }

    getQueryValueOperation = (operation: string, value: string): string => {
        let targetOperation: string = "";
        switch (operation) {
            case '%':
                targetOperation = `%${value}%`;
                break;
            case '%=':
                targetOperation = `%${value}`;
                break;
            case '=%':
                targetOperation = `${value}%`;
                break;
            default:
                targetOperation = `${value}`;
                break;
        }
        return targetOperation;
    }
}