import { Injectable, ConflictException, BadRequestException, NotFoundException, InternalServerErrorException, Request, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from "bcrypt";
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { uploadFile, getFormattedDate, getData } from 'src/util/utils';
import { GetFilterType, FormattedDateType } from 'src/types/types';
import { AbilityFactory, Action } from 'src/ability/ability.factory';
import { PasswordResetDto } from './dto/password-reset.dto';
import { TokenService } from 'src/token/token.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CustomError } from 'src/util/custom-error';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly configService: ConfigService,
    private abilityFactory: AbilityFactory,
    private tokenService: TokenService,
  ) { }

  async getSingleUser(_username: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: [{ username: _username }],
    });
    return user;
  }

  async getUsers(filter: GetFilterType): Promise<any> {
    const users = await getData(this.usersRepository, "user", filter);
    return users;
  }

  async createUser(user: User, file: Express.Multer.File) {
    const existingUser = await this.findByUsernameOrEmail(user.username, user.email);
    if (existingUser) throw new ConflictException();
    let fileUrl = this.configService.get<string>("dummy_pp_path");
    if (file) {
      fileUrl = await uploadFile(this.configService.get<string>("pp_upload_path"), file);
    }

    const hashedPassword = await this.hashPassword(user.password);
    const currentDate: FormattedDateType = getFormattedDate();
    const userReadyToBeInsterted = Object.assign({}, user, {
      password: hashedPassword,
      profilePicture: `${this.configService.get<string>("site_url")}/images/pic=${fileUrl}`,
      signupDate: currentDate.fullDate,
      lastLoginDate: currentDate.fullDate,
      authLevel: "user",
      active: "true",
      verified: "false",
    });

    try {
      const createdUser = await this.usersRepository.save(userReadyToBeInsterted);
      const { password, ...user } = createdUser;

      const verifyToken = await this.tokenService.createVerifyToken(createdUser);

      return user;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async updateUser(request: Request, user: User, file: Express.Multer.File | null) {
    const existingUser = await this.findByUsernameOrEmail(user.username, user.email);
    const authVerified = await this.verifyAuth(request, existingUser, Action.Update);
    if (!authVerified) throw new ForbiddenException();
    let userReadyToBeUpdated = user, fileUrl: string;
    if (user.password) {
      const hashedPassword = await this.hashPassword(user.password);
      userReadyToBeUpdated.password = hashedPassword;
    }
    // Dosya yüklendiyse önceki dosyayı sil, yenisini yükle | Dummy ise silme
    if (file) {
      const isDeleted = await this.removeFile(existingUser.profilePicture);
      if (isDeleted) {
        fileUrl = await uploadFile(this.configService.get<string>("pp_upload_path"), file);
        userReadyToBeUpdated.profilePicture = fileUrl;
      }
      else throw new NotFoundException("An error occured when updating profile picture.");
    }

    try {
      await this.usersRepository.update({ username: userReadyToBeUpdated.username }, userReadyToBeUpdated);
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async deleteUser(request: Request, _username: string) {
    const existingUser = await this.getSingleUser(_username);
    const authVerified = await this.verifyAuth(request, existingUser, Action.Delete);
    if (!authVerified) throw new ForbiddenException();
    try {
      await this.usersRepository.update({ username: _username }, { active: "false" });
    } catch {
      throw new NotFoundException();
    }
  }

  async forgotPassword(emailObj: ForgotPasswordDto) {
    const user = await this.findByUsernameOrEmail("", emailObj.email);
    try {
      const resetToken = await this.tokenService.createResetToken(user.username, emailObj.email);
      return { resetToken };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async resetPassword(request: Request, passwordObj: PasswordResetDto) {
    const token = request['params'].token;
    const existingToken = await this.tokenService.findOneByToken(token);
    if (existingToken.expireDate < new Date()) throw new NotFoundException("Token expired.");
    if (passwordObj.password !== passwordObj.passwordRepeat) throw new BadRequestException();
    try {
      const hashedPassword = await this.hashPassword(passwordObj.password);
      const result = await this.usersRepository.update({ username: existingToken.username }, { password: hashedPassword });
      return result;
    }
    catch (error) {
      throw new BadRequestException();
    }

    return;
    // if (passwordObj.password !== passwordObj.passwordRepeat) {
    //   throw new BadRequestException("Password repeat doesn't match.");
    // }
    // const existingUser = await this.getSingleUser(request['user'].username);
    // if (!existingUser) {
    //   throw new NotFoundException("User not found.");
    // }
    // const doesPasswordMatch = await bcrypt.compare(passwordObj.previousPassword, existingUser.password);
    // if (!doesPasswordMatch) {
    //   throw new ForbiddenException();
    // }
    // try {
    //   const recentPassword = await this.hashPassword(passwordObj.password);
    //   await this.usersRepository.update({ username: existingUser.username }, { password: recentPassword });
    //   await this.tokenService.remove(existingUser.username);
    // } catch (error) {
    //   throw new NotFoundException();
    // }
  }

  async createNewVerifyToken(request: Request) {
    const username = request['user'] && request['user'].username ? request['user'].username : null;
    if (!username) throw new NotFoundException();
    const foundUser = await this.findByUsernameOrEmail(username, "");
    if (!foundUser) throw new NotFoundException();
    const verifyToken = await this.tokenService.createVerifyToken(foundUser);
    return verifyToken;
  }

  // UTIL
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async findByUsernameOrEmail(username: string | undefined, email: string | undefined): Promise<User> {
    const query = this.usersRepository.createQueryBuilder('user')
      .where(qb => {
        qb.where('user.username = :username', { username })
          .orWhere('user.email = :email', { email });
      })
      .getOne();
    return query;
  }

  // Profil resmi güncellenirken önceki resmi silme
  async removeFile(filePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Eğer önceki resim dummy picture ise silme, true ile devam et.
      if (filePath == this.configService.get<string>("dummy_pp_path")) {
        return resolve(true);
      }
      try {
        fs.unlinkSync(filePath);
        resolve(true);
      }
      catch (error) {
        console.log(error);
        resolve(false);
      }
    });
  }

  async verifyAuth(request: Request, user: User, action: Action.Update | Action.Delete): Promise<boolean> {
    const ability = this.abilityFactory.defineAbility(request['user']);
    return ability.can(action, user);
  }
}
