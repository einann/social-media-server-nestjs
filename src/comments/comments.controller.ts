import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, UsePipes, Request, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { DecomposeFilterPipe } from 'src/pipes/decompose-filter.pipe';
import { GetFilterType } from 'src/types/types';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
    constructor(private service: CommentsService) { }

    @Post('get')
    @HttpCode(HttpStatus.OK)
    @UsePipes(DecomposeFilterPipe)
    getMultiple(@Body() filter: GetFilterType) {
        return this.service.getComments(filter);
    }

    @Post()
    create(
        @Req() request: Request,
        @Body() comment: CreateCommentDto
    ) {
        return this.service.createComment(request, comment);
    }

    @Delete(':commentId')
    delete(
        @Req() request: Request,
        @Param() params
    ) {
        return this.service.deleteComment(request, params.commentId);
    }
}