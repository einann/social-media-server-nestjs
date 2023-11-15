import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UsePipes,
  ClassSerializerInterceptor,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  UseGuards,
  Request
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidatorPipe } from './pipes/image-validator.pipe';
import { DecomposeFilterPipe } from 'src/pipes/decompose-filter.pipe';
import { GetFilterType } from 'src/types/types';
import { AbilityFactory, Action } from 'src/ability/ability.factory';
import { AbilitiesGuard } from 'src/ability/abilities.guard';
import { CheckAbilities } from 'src/ability/abilities.decorator';
import { User } from './user.entity';
import { CreateUserAbility, ReadUserAbility, UpdateUserAbility } from 'src/ability/entity_abilities/user.abilities';
import { PasswordResetDto } from './dto/password-reset.dto';

@Controller('users')
export class UsersController {
  constructor(
    private service: UsersService,
  ) { }

  @Get(':username')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities(new ReadUserAbility())
  @UseInterceptors(ClassSerializerInterceptor)
  getSingle(@Param() params) {
    return this.service.getSingleUser(params.username);
  }

  @Post('get')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities(new ReadUserAbility())
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(DecomposeFilterPipe)
  getMultiple(@Body() filter: GetFilterType) {
    return this.service.getUsers(filter);
  }

  @Post()
  @UseGuards(AbilitiesGuard)
  @CheckAbilities(new CreateUserAbility())
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(ImageValidatorPipe)
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() user: CreateUserDto,
  ) {
    return this.service.createUser(user, file);
  }

  @Post('passwordreset')
  @HttpCode(HttpStatus.OK)
  resetPassword(
    @Request() request: Request,
    @Body() passwordObj: PasswordResetDto,
  ) {
    return this.service.resetPassword(request, passwordObj);
  }

  @Put()
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(ImageValidatorPipe)
  update(
    @Request() request: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() user: UpdateUserDto,
  ) {
    return this.service.updateUser(request, user, file);
  }

  @Delete(':username')
  delete(
    @Request() request: Request,
    @Param() params
  ) {
    return this.service.deleteUser(request, params.username);
  }
}
