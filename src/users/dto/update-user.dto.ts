import { IsString, IsBoolean, IsNumber, IsDateString, MaxLength, IsEmail, IsNotEmpty, IsOptional, MinLength, IsArray, IsEmpty } from "class-validator";
import { Likes } from "src/likes/likes.entity";

export class UpdateUserDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(25)
    username: string;

    @IsOptional()
    @IsString()
    active: string;

    @IsOptional()
    @IsString()
    authLevel: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(25)
    firstName: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(25)
    lastName: string;

    @IsOptional()
    @IsDateString()
    birthday: Date;

    @IsOptional()
    @IsEmail()
    @MinLength(6)
    @MaxLength(50)
    @IsString()
    email: string;

    @IsOptional()
    @MaxLength(300)
    @IsString()
    password: string;

    @IsOptional()
    @MaxLength(300)
    @IsString()
    profilePicture: string;

    @IsOptional()
    @IsDateString()
    signupDate: string;

    @IsOptional()
    @IsDateString()
    lastLoginDate: string;

    @IsOptional()
    @MinLength(4)
    @MaxLength(6)
    @IsString()
    gender: string;

    @IsOptional()
    @IsString()
    verified: string;

    @IsOptional()
    likes: Likes[];
}