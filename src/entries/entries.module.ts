import { Module } from '@nestjs/common';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entry } from './entry.entity';
import { AbilityModule } from 'src/ability/ability.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Entry]),
    AbilityModule,
  ],
  providers: [EntriesService],
  controllers: [EntriesController],
  exports: [EntriesService]
})
export class EntriesModule {}
