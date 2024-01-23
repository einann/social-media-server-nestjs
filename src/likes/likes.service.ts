import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Likes } from './likes.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getData, getFormattedDate } from 'src/util/utils';
import { FormattedDateType, GetFilterType } from 'src/types/types';
import { defineAbility } from '@casl/ability';

@Injectable()
export class LikesService {
    constructor(@InjectRepository(Likes) private likesRepository: Repository<Likes>) { }

    async getLikes(filter: GetFilterType): Promise<Likes> {
        const likes = await getData(
            this.likesRepository,
            'likes',
            filter,
            [
                { sourceField: 'likes.user', targetTable: 'user', condition: 'user.username = likes.user' },
                { sourceField: 'likes.entry', targetTable: 'entry', condition: 'entry.entryId = likes.entry' },
                { sourceField: 'likes.comment', targetTable: 'comment', condition: 'comment.commentId = likes.comment' },
            ],
            ['likes', 'user.username', 'user.authLevel', 'user.firstName', 'user.lastName', 'user.profilePicture', 'user.gender', 'entry', 'comment']
        );
        return likes;
    }

    async createLike(request: Request, likes: Likes) {
        // Check if the user liked the entry or comment
        const target = Object.keys(request.body)[0];
        const existingLike = await this.likesRepository.createQueryBuilder('likes')
            .where(qb => {
                qb.where('likes.user = :user', { user: request['user'].username })
                    .andWhere(`likes.${target} = :${target}`, { [target]: likes[target] });
            })
            .getOne();

        if (existingLike) {
            throw new ConflictException();
        }

        try {
            const currentDate: FormattedDateType = getFormattedDate();
            const likesFinal = Object.assign({}, likes, {
                user: request['user'].username,
                createDate: currentDate.fullDate,
                createTime: currentDate.fullTime,
            });
            const result = await this.likesRepository.save(likesFinal);
            return {
                ...result,
                user: request['user'],
            };
        } catch (error) {
            console.log(error);
            throw new NotFoundException();
        }
    }

    async deleteLike(request: Request, _id: string) {
        const entry = await this.likesRepository.createQueryBuilder('likes')
            .leftJoinAndSelect('likes.entry', 'entry')
            .where('entry.entryId = :entryId', { entryId: _id })
            .andWhere('likes.user = :username', { username: request['user'].username })
            .getOne();
        const comment = await this.likesRepository.createQueryBuilder('likes')
            .leftJoinAndSelect('likes.comment', 'comment')
            .where('comment.commentId = :commentId', { commentId: _id })
            .andWhere('likes.user = :username', { username: request['user'].username })
            .getOne();
        if (!entry && !comment) throw new NotFoundException();

        const foundLike = {
            object: entry || comment,
            target: entry ? 'entry' : 'comment',
        }
        // const authVerified = this.verifyAuth(request, foundLike.target, foundLike.object);
        // if (!authVerified) throw new ForbiddenException();
        try {
            return await this.likesRepository.delete({ id: foundLike.object.id });
        }
        catch {
            throw new NotFoundException();
        }
    }

    verifyAuth(request: Request, target: string, like: Likes): boolean {
        const ability = defineAbility((can) => {
            can('delete', 'Likes', {
                [`${target}.createdUser`]: request['user'].username,
            });
        });
        return ability.can('delete', like);
    }
}
