import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UsePipes, Request, Req } from '@nestjs/common';
import { LikesService } from './likes.service';
import { DecomposeFilterPipe } from 'src/pipes/decompose-filter.pipe';
import { GetFilterType } from 'src/types/types';

@Controller('likes')
export class LikesController {
    constructor(private service: LikesService) { }

    @Post('get')
    @HttpCode(HttpStatus.OK)
    @UsePipes(DecomposeFilterPipe)
    getMultiple(@Body() filter: GetFilterType) {
        return this.service.getLikes(filter);
    }

    @Post()
    create(
        @Req() request: Request,
        @Body() likes
    ) {
        return this.service.createLike(request, likes);
    }

    @Delete(':id')
    delete(
        @Req() request: Request,
        @Param() params
    ) {
        return this.service.deleteLike(request, params.id);
    }
}
