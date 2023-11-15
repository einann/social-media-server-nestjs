import { Module } from '@nestjs/common';
import { FollowingListController } from './following_list.controller';
import { FollowingListService } from './following_list.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowingList } from './following_list.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FollowingList])
  ],
  providers: [FollowingListService],
  controllers: [FollowingListController],
  exports: [FollowingListService],
})
export class FollowingListModule {}
