import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { AbilityModule } from 'src/ability/ability.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    AbilityModule,
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
