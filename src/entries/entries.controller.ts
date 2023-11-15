import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, UploadedFile, UseInterceptors, UsePipes, Request } from '@nestjs/common';
import { EntriesService } from './entries.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { GetFilterType } from 'src/types/types';
import { DecomposeFilterPipe } from 'src/pipes/decompose-filter.pipe';

@Controller('entries')
export class EntriesController {
    constructor(private service: EntriesService) { }

    @Get(':entryId')
    getSingle(@Param() params) {
        return this.service.getSingleEntry(params.entryId);
    }

    @Post('get')
    @HttpCode(HttpStatus.OK)
    @UsePipes(DecomposeFilterPipe)
    getMultiple(@Req() request, @Body() filter: GetFilterType) {
        console.log(request)
        console.log(filter)
        return this.service.getEntries(filter);
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    create(
        @Req() request: Request,
        @UploadedFile() file: Express.Multer.File,
        @Body() entry: CreateEntryDto,
    ) {
        return this.service.createEntry(request, entry, file);
    }

    @Put()
    update(
        @Req() request: Request,
        @Body() entry: UpdateEntryDto,
    ) {
        return this.service.updateEntry(request, entry);
    }

    @Delete(':entryId')
    delete(
        @Req() request: Request,
        @Param() params,
    ) {
        return this.service.deleteEntry(request, params.entryId);
    }
}
