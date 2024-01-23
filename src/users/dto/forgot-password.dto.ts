import { IsString, MaxLength, IsNotEmpty, IsEmail, MinLength } from "class-validator";

// Gelen istek doğrulaması
export class ForgotPasswordDto {
    @IsNotEmpty()
    @IsEmail()
    @MinLength(5)
    @MaxLength(50)
    @IsString()
    email: string;
}