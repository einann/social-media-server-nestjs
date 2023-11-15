import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, Req, UsePipes, Request } from '@nestjs/common';
import { FollowingListService } from './following_list.service';
import { CreateFollowingListDto } from './dto/create-following_list-dto';
import { DecomposeFilterPipe } from 'src/pipes/decompose-filter.pipe';
import { GetFilterType } from 'src/types/types';

@Controller('following-list')
export class FollowingListController {
    constructor(private service: FollowingListService) { }

    @Post('get_following')
    @HttpCode(HttpStatus.OK)
    @UsePipes(DecomposeFilterPipe)
    getFollowing(@Body() filter: GetFilterType) {
        return this.service.getFollowingList(filter);
    }

    @Post('get_followers')
    @HttpCode(HttpStatus.OK)
    @UsePipes(DecomposeFilterPipe)
    getFollowers(@Body() filter: GetFilterType) {
        return this.service.getFollowerList(filter);
    }

    @Post()
    create(@Body() fList: CreateFollowingListDto) {
        return this.service.createFollowingListItem(fList);
    }

    @Delete()
    delete(
        @Req() request: Request,
        @Body() deleteObj: CreateFollowingListDto
    ) {
        return this.service.deleteFollowingListItem(request, deleteObj);
    }
}
