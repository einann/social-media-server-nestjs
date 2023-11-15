import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Entry } from "src/entries/entry.entity";
import { Likes } from "src/likes/likes.entity";

export class CreateCommentDto {
    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(10)
    commentId: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(10)
    parentId: Entry;

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
    likes: Likes[];
}