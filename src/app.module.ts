import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EntriesModule } from './entries/entries.module';
import { LikesModule } from './likes/likes.module';
import { CommentsModule } from './comments/comments.module';
import { FollowingListModule } from './following_list/following_list.module';
import { AbilityModule } from './ability/ability.module';
import { TokenModule } from './token/token.module';
import config from 'config/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    // ConfigModule.forRoot(), // .env dosyasındaki çevresel değişkenleri yükler
    ConfigModule.forRoot({
      envFilePath: ['.dev.env', '.live.env'],
      load: [config],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('connection.host'),
        port: configService.get<number>('connection.port'),
        username: configService.get('connection.username'),
        password: configService.get('connection.password'),
        database: configService.get('connection.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('email_smtp_host'),
          auth: {
            user: configService.get('email_adress_pwreset'),
            pass: configService.get('email_app_password'),
          }
        },
        defaults: {
          from: ''
        },
        template: {
          dir: __dirname + "/token/templates",
          adapter: new HandlebarsAdapter(),
          options: {
            strictt: true,
          }
        }
      })
    }),
    UsersModule,
    AuthModule,
    EntriesModule,
    LikesModule,
    CommentsModule,
    FollowingListModule,
    AbilityModule,
    TokenModule,
    ImagesModule,
  ],
})
export class AppModule { }
