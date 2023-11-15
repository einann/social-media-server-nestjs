import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowingList } from './following_list.entity';
import { FormattedDateType, GetFilterType } from 'src/types/types';
import { generateRandomString, getData, getFormattedDate } from 'src/util/utils';
import { defineAbility } from '@casl/ability';

@Injectable()
export class FollowingListService {
    constructor(
        @InjectRepository(FollowingList) private followingListRepository: Repository<FollowingList>,
    ) { }

    // e.g -> field = follower, value = xyz (Returns users which xyz follows)
    async getFollowingList(filter: GetFilterType): Promise<any> {
        const followingList = await getData(
            this.followingListRepository,
            'following_list',
            filter,
            [
                { sourceField: 'following_list.following', targetTable: 'user', condition: '' },
            ],
            ['following_list', 'user.username', 'user.authLevel', 'user.firstName', 'user.lastName', 'user.profilePicture', 'user.gender']
        );
        return followingList;
    }

    // e.g -> field = following, value = xyz (Returns users which follows xyz)
    async getFollowerList(filter: GetFilterType): Promise<any> {
        const followingList = await getData(
            this.followingListRepository,
            'following_list',
            filter,
            [
                { sourceField: 'following_list.follower', targetTable: 'user', condition: '' },
            ],
            ['following_list', 'user.username', 'user.authLevel', 'user.firstName', 'user.lastName', 'user.profilePicture', 'user.gender']
        );
        return followingList;
    }

    async createFollowingListItem(fList: FollowingList) {
        const randomId = generateRandomString(10);
        const currentDate: FormattedDateType = getFormattedDate();
        const fListReadyToBeInsterted = Object.assign({}, fList, {
            id: randomId,
            createDate: currentDate.fullDate,
            createTime: currentDate.fullTime,
            follower: fList.follower,
            following: fList.following,
        });

        try {
            await this.followingListRepository.save(fListReadyToBeInsterted);
        } catch (error) {
            throw new ConflictException();
        }
    }

    async deleteFollowingListItem(request: Request, deleteObj: FollowingList) {
        const followerInfo = await this.followingListRepository.createQueryBuilder('following_list')
            .leftJoinAndSelect('following_list.follower', 'user')
            .where('user.username = :username', { username: deleteObj.follower })
            .getOne();
        const authVerified = this.verifyAuth(request, followerInfo);
        if (!authVerified) throw new ForbiddenException();
        try {
            const query = await this.followingListRepository.createQueryBuilder('following_list')
                .delete()
                .from(FollowingList)
                .where("following = :following", { following: deleteObj.following })
                .andWhere("follower = :follower", { follower: deleteObj.follower })
                .execute();
            if (query.affected === 0) {
                throw new NotFoundException();
            }
            return {
                message: "Item deleted successfully.",
            };
        }
        catch (error) {
            throw new NotFoundException();
        }
    }

    verifyAuth(request: Request, fList: FollowingList): boolean {
        const ability = defineAbility((can) => {
            can('delete', 'FollowingList', {
                'follower.username': request['user'].username,
            });
        });
        return ability.can('delete', fList);
    }
}
