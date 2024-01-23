import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { generateRandomString, getFormattedDate } from 'src/util/utils';
import { FormattedDateType } from 'src/types/types';
import { CustomError } from 'src/util/custom-error';
import { User } from 'src/users/user.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private readonly mailerService: MailerService,
  ) { }

  async createResetToken(username: string, email: string) {
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
      verifyToken: null,
    }
    try {
      await this.tokenRepository.save(tokenObj);
      await this.sendResetMail(email, resetToken);
      return resetToken;
    } catch (error) {
      await this.tokenRepository.delete(username);
      throw new CustomError(500, "An error occured, please try again later.");
    }
  }

  //
  async createVerifyToken(user: User) {
    const expireDate = Date.now() + (10 * 60 * 1000); // 10 minutes
    const currentDate: FormattedDateType = getFormattedDate();
    const verifyToken = generateRandomString(50);
    const tokenObj = {
      username: user.username,
      email: user.email,
      verifyToken,
      createDate: currentDate.fullDate,
      createTime: currentDate.fullTime,
      expireDate: new Date(expireDate),
      resetToken: null,
    }
    try {
      await this.tokenRepository.save(tokenObj);
      await this.sendVerifyMail(user.email, verifyToken);
    } catch (error) {
      // await this.tokenRepository.delete(user.username);
      throw new CustomError(500, "An error occured, please try again later.");
    }
    return tokenObj;
  }
  //

  async sendResetMail(email: string, link: string) {
    return await this.mailerService.sendMail({
      to: email,
      from: 'noreply@nestjs.com',
      subject: 'Password Reset Information',
      html:
        `
          <p>In order to reset your password, please click the link below:</p>
          <a href="http://localhost:3000/changepassword?token=${link}">Reset Password</a>
        `
    });
  }

  async sendVerifyMail(email: string, link: string) {
    return await this.mailerService.sendMail({
      to: email,
      from: 'noreply@nestjs.com',
      subject: 'Account Verification',
      html:
        `
          <p>In order to verify your account, please click the link below:</p>
          <a href="http://localhost:3000/verify?token=${link}">Verify Account</a>
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

  async findOneByToken(token: string) {
    const record = await this.tokenRepository.findOne({
      where: [{ resetToken: token }],
    });
    if (!record) throw new NotFoundException();
    return record;
  }

  async remove(_username: string) {
    try {
      await this.tokenRepository.delete(_username);
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
