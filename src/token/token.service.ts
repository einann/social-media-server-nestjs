import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { generateRandomString, getFormattedDate } from 'src/util/utils';
import { FormattedDateType } from 'src/types/types';
import { CustomError } from 'src/util/custom-error';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private readonly mailerService: MailerService,
  ) { }

  async create(request: Request) {
    const { username, email } = request['user'];

    const existingToken = await this.findOne(username);
    if (existingToken && existingToken.expireDate > new Date()) {
      return {
        message: "You can reset your password by clicking to link on your e-mail."
      }
    }

    const expireDate = Date.now() + (10 * 60 * 1000); // 10 minutes
    const currentDate: FormattedDateType = getFormattedDate();
    const resetToken = generateRandomString(50);
    const tokenObj = {
      username,
      email,
      resetToken,
      createDate: currentDate.fullDate,
      createTime: currentDate.fullTime,
      expireDate: new Date(expireDate),
    }

    try {
      await this.tokenRepository.save(tokenObj);
      await this.sendResetMail(email, resetToken);
    } catch (error) {
      await this.tokenRepository.delete(username);
      throw new CustomError(500, "An error occured, please try again later");
    }

    return tokenObj;
  }

  async sendResetMail(email: string, link: string) {
    return await this.mailerService.sendMail({
      to: email,
      from: 'noreply@nestjs.com',
      subject: 'Password Reset Information',
      html:
        `
          <p>In order to reset your password, please click the link below:</p>
          <a href="http://localhost:3001/reset-password?token=${link}">Reset Password</a>
        `
    });
  }

  findAll() {
    return `This action returns all token`;
  }

  async findOne(_username: string) {
    const token = await this.tokenRepository.findOne({
      where: [{ username: _username }],
    });
    return token;
  }

  async remove(_username: string) {
    try {
      await this.tokenRepository.delete(_username);
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
