import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { TokenService } from './token.service';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) { }

  @Post()
  @HttpCode(HttpStatus.OK)
  create(
    @Req() request: Request,
  ) {
    return this.tokenService.create(request);
  }

  @Get()
  findAll() {
    return this.tokenService.findAll();
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.tokenService.findOne(username);
  }

  @Delete(':username')
  remove(@Param('username') username: string) {
    return this.tokenService.remove(username);
  }
}
