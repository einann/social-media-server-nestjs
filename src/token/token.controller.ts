import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { TokenService } from './token.service';

@Controller('token')
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
  ) { }

  @Get()
  findAll() {
    return this.tokenService.findAll();
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.tokenService.findOne(username);
  }

  @Get('by/:token')
  findOneByToken(@Param('token') token: string) {
    return this.tokenService.findOneByToken(token);
  }

  @Delete(':username')
  remove(@Param('username') username: string) {
    return this.tokenService.remove(username);
  }
}
