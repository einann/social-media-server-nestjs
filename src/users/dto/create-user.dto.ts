import { IsString, IsDateString, MaxLength, IsEmail, IsNotEmpty, IsOptional, MinLength } from "class-validator";
import { FollowingList } from "src/following_list/following_list.entity";
import { Likes } from "src/likes/likes.entity";
import { User } from "../user.entity";

// Gelen istek doğrulaması
export class CreateUserDto {
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

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(25)
  lastName: string;

  @IsNotEmpty()
  @IsDateString() // ISO-8601 date format -> 20231231 veya 2023-12-31 gibi (YYYYMMDD | YYYY-MM-DD)
  birthday: Date;

  @IsNotEmpty()
  @IsEmail()
  @MinLength(6)
  @MaxLength(50)
  @IsString()
  email: string;

  @IsNotEmpty()
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

  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(6)
  @IsString()
  gender: string;

  @IsOptional()
  likes: Likes[];
}