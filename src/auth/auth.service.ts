import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

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

        const access_token = await this.jwtService.signAsync(payload);

        res.cookie('access_token', `Bearer ${access_token}`, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            // expires: new Date(Date.now() + 1 * 24)
        });

        return {
            access_token: await this.jwtService.signAsync(payload),
        }
    }
}
