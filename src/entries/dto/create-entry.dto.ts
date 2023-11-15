import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Comment } from "src/comments/comment.entity";
import { Likes } from "src/likes/likes.entity";
import { User } from "src/users/user.entity";

export class CreateEntryDto {
    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(10)
    entryId: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(256)
    content: string;

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

    @IsOptional()
    @IsString()
    createdUser: string;

    @IsOptional()
    @IsString()
    active: string;

    @IsOptional()
    @IsString()
    contentImage: string;

    @IsOptional()
    likes: Likes[];

    @IsOptional()
    comments: Comment[];
}