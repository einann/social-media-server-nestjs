import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieparser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: 'http://localhost:3000'
  });
  app.use(cookieparser());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  await app.listen(3001);
}
bootstrap();