import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

const EXPIRE_TIME = 60 * 60 * 24 * 1000; // 1day

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async login(username: string, pass: string, res: Response): Promise<object> {
        const user = await this.usersService.getSingleUser(username);
        if (!user) {
            throw new NotFoundException();
        }
        const doesPasswordMatch = await bcrypt.compare(pass, user.password);
        if (!doesPasswordMatch) {
            throw new UnauthorizedException();
        }
        const payload = {
            username: user.username,
            email: user.email,
            authLevel: user.authLevel,
        };

        const { password, ...extUser } = user;

        return {
            user: extUser,
            tokens: {
                access_token: await this.jwtService.signAsync(payload, {
                    expiresIn: '1d',
                    secret: process.env.SECRET_KEY
                }),
                refresh_token: await this.jwtService.signAsync(payload, {
                    expiresIn: '7d',
                    secret: process.env.REFRESH_TOKEN_KEY
                }),
                expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
            }
        }
    }

    async setRefreshToken(user: any) {
        const payload = {
            username: user.username,
            email: user.email,
            authLevel: user.authLevel,
        }
        return {
            access_token: await this.jwtService.signAsync(payload, {
                expiresIn: '1d',
                secret: process.env.SECRET_KEY
            }),
            refresh_token: await this.jwtService.signAsync(payload, {
                expiresIn: '7d',
                secret: process.env.REFRESH_TOKEN_KEY
            }),
            expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
        }
    }
}
