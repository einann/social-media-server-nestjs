import { InternalServerErrorException, BadRequestException } from "@nestjs/common";
import { randomBytes } from "crypto";
import * as fs from "fs";
import * as path from "path";
import { Repository, SelectQueryBuilder } from "typeorm";
import { FormattedDateType, JoinObjectType } from "src/types/types";

// Generate random string for file names and post id's
export function generateRandomString(length: number): string {
    return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

// Upload file to specific path (used at user profile pictures and entry images)
export async function uploadFile(destinationFolder: string, file: Express.Multer.File): Promise<string> {
    if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder, { recursive: true });
    }
    const fileName = generateRandomString(10) + "_" + Date.now() + path.extname(file.originalname);
    const fullFilePath = path.join(destinationFolder, fileName);

    return new Promise((resolve, reject) => {
        try {
            fs.writeFileSync(fullFilePath, file.buffer);
            // resolve(fullFilePath);
            resolve(fileName);
        } catch (error) {
            throw new InternalServerErrorException();
        }
    });
}

// Returns string fulldate and fulltime
export function getFormattedDate(): FormattedDateType {
    let date = new Date();
    const offset = new Date().getTimezoneOffset();
    date = new Date(date.getTime() - (offset * 60 * 1000));

    return {
        fullDate: date.toISOString().split('T')[0].split("-").join(""), // YYYYMMDD
        fullTime: date.toISOString().split("T")[1].split(".")[0].split(":").join("") // HHMMSS
    };
}

// Generates createQueryBuilder function structure right after decompose filter pipe
export function onFinalFilterTouch(filter, tableName: string) {
    let whereStatement = [], finalWhereStatement = "";
    const andStatements = Object.keys(filter).filter(key => key.includes("AND"));
    const orStatements = Object.keys(filter).filter(key => key.includes("OR"));

    andStatements.forEach(statement => {
        const query = filter[statement].map((x: { query: string; }) => `${tableName}${x.query}`).join(` ${statement.split("_")[0]} `);
        whereStatement.push(`(${query})`);
    });
    orStatements.forEach(statement => {
        const query = filter[statement].map((x: { query: string; }) => `${tableName}${x.query}`).join(` ${statement.split("_")[0]} `);
        whereStatement.push(`(${query})`);
    });
    finalWhereStatement = whereStatement.join(` ${filter.globalGroup || 'AND'} `);
    return {
        where: [finalWhereStatement, filter.values],
        orderBy: filter.orderBy,
        skip: filter.skip,
        take: filter.take,
    };
}

// Function to be used in every get request
export async function getData(repo: Repository<any>, tableName: string, filter, allJoins: JoinObjectType[] = [], selectFields: string[] = []): Promise<any> {
    let queryBuilder: SelectQueryBuilder<any>;
    let details = filter.values === "GETALL" ? filter : onFinalFilterTouch(filter, tableName);
    queryBuilder = repo.createQueryBuilder(tableName)
        .orderBy(details.orderBy[0], details.orderBy[1])
        .skip(details.skip)
        .take(details.take);

    if (filter.values !== "GETALL") {
        queryBuilder.where(details.where[0], details.where[1]);
    }

    if (allJoins.length && selectFields.length) {
        allJoins.forEach(sJoin => {
            queryBuilder.leftJoin(sJoin.sourceField, sJoin.targetTable, sJoin.condition);
        });
        queryBuilder.select(selectFields);
    }

    try {
        return await queryBuilder.getMany();
    }
    catch (error) {
        console.log(error);
        throw new InternalServerErrorException();
    }
}