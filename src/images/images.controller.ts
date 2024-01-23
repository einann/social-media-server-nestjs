import { Controller, Get, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Public } from 'src/auth/constants/auth.constants';

@Controller('images')
export class ImagesController {
    constructor(
        private readonly configService: ConfigService,
    ) { }
    @Public()
    @Get(':param')
    serveProfilePicture(@Param('param') param: string, @Res() res: Response) {
        const imageName = param.split("=")[1];
        const path = this.configService.get<string>("pp_upload_path") + "\\" + imageName;
        return res.sendFile(path);
    }
}
