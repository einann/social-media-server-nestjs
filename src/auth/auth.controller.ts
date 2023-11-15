import { Body, Controller, Post, Get, Request, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { Public } from './constants/auth.constants';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post()
    login(@Body() loginDto: AuthLoginDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.login(loginDto.username, loginDto.password, res);
    }
}