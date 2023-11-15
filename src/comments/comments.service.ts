import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { Repository } from 'typeorm';
import { FormattedDateType, GetFilterType } from 'src/types/types';
import { generateRandomString, getData, getFormattedDate } from 'src/util/utils';
import { AbilityFactory, Action } from 'src/ability/ability.factory';
import { defineAbility } from '@casl/ability';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
        private abilityFactory: AbilityFactory,
    ) { }

    async getSingleComment(_commentId: string): Promise<Comment> {
        const comment = await this.commentsRepository.findOne({
            where: [{ commentId: _commentId }],
        });
        return comment;
    }

    async getSingleCommentWithParent(_commentId: string): Promise<any> {
        const queryBuilder = this.commentsRepository.createQueryBuilder('comment')
            .where('comment.commentId = :commentId', { commentId: _commentId })
            .leftJoin("comment.parentId", 'entry')
            .select(['comment', 'entry']);

        return await queryBuilder.getOne();
    }

    async getComments(filter: GetFilterType): Promise<Comment[]> {
        const comments = await getData(
            this.commentsRepository,
            'comment',
            filter,
            [
                { sourceField: 'comment.parentId', targetTable: 'entry', condition: '' },   // Joins parent entry of comment
                { sourceField: 'comment.likes', targetTable: 'likes', condition: '' },      // Joins likes of comment
                { sourceField: 'likes.user', targetTable: 'user', condition: '' },          // Joins users of likes of comment
            ],
            ['comment', 'entry', 'likes', 'user.username', 'user.authLevel', 'user.firstName', 'user.lastName', 'user.profilePicture', 'user.gender']
        );
        return comments;
    }

    async createComment(request: Request, comment: Comment) {
        const randomId = generateRandomString(10);
        const currentDate: FormattedDateType = getFormattedDate();
        const commentReadyToBeInsterted = Object.assign({}, comment, {
            commentId: randomId,
            content: comment.content.trim(),
            createDate: currentDate.fullDate,
            createTime: currentDate.fullTime,
            createdUser: request['user'].username,
            active: "true",
        });

        try {
            await this.commentsRepository.save(commentReadyToBeInsterted);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    async deleteComment(request: Request, _commentId: string) {
        const existingEntry = await this.getSingleCommentWithParent(_commentId);
        const authVerified = await this.verifyAuth(request, existingEntry, Action.Delete);
        const ability = defineAbility((can) => {
            can('delete', 'Comment', {
                'parentId.createdUser': request['user'].username,
            });
        }); // If comment's parent entry is created by user that incoming from request, than that user can delete the comment because of ownership of parent entry.
        const isCreatedCommentsParentEntry = ability.can('delete', existingEntry);

        if (!authVerified && !isCreatedCommentsParentEntry) throw new ForbiddenException();
        try {
            await this.commentsRepository.update({ commentId: _commentId }, { active: "false" });
        } catch {
            throw new NotFoundException();
        }
    }

    async verifyAuth(request: Request, comment: Comment, action: Action.Delete): Promise<boolean> {
        const ability = this.abilityFactory.defineAbility(request['user']);
        return ability.can(action, comment);
    }
}