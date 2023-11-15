import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { User } from "src/users/user.entity";

export class CreateFollowingListDto {
    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(10)
    id: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(8)
    createTime: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    @MaxLength(6)
    createDate: string;

    @IsNotEmpty()
    following: User;

    @IsNotEmpty()
    follower: User;
}