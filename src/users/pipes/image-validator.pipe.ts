import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import * as path from "path";

@Injectable()
export class ImageValidatorPipe implements PipeTransform {
    constructor() { }

    transform(value: any) {
        if (value && Object.keys(value).includes("mimetype")) {
            if (![".jpg", ".jpeg"].includes(path.extname(value.originalname))) {
                throw new BadRequestException("Wrong file extension");
            }
            else if (value.size > 1000000) {
                throw new BadRequestException("Image size cannot be above 1MB.");
            }
        }
        return value;
    }
}