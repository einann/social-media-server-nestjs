import { IsString, MaxLength, IsNotEmpty } from "class-validator";

// Gelen istek doğrulaması
export class PasswordResetDto {
    @IsNotEmpty()
    @MaxLength(300)
    @IsString()
    previousPassword: string;

    @IsNotEmpty()
    @MaxLength(300)
    @IsString()
    password: string;

    @IsNotEmpty()
    @MaxLength(300)
    @IsString()
    passwordRepeat: string;
}