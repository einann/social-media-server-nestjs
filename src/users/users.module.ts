import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { AbilityModule } from 'src/ability/ability.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AbilityModule,
    TokenModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule { }
