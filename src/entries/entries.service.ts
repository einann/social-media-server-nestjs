import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, Request } from '@nestjs/common';
import { Entry } from './entry.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateRandomString, uploadFile, getFormattedDate, getData } from 'src/util/utils';
import { ConfigService } from '@nestjs/config';
import { FormattedDateType, GetFilterType } from 'src/types/types';
import { AbilityFactory, Action } from 'src/ability/ability.factory';

@Injectable()
export class EntriesService {
    constructor(
        @InjectRepository(Entry) private entriesRepository: Repository<Entry>,
        private readonly configService: ConfigService,
        private abilityFactory: AbilityFactory,
    ) { }

    async getSingleEntry(_entryId: string): Promise<Entry> {
        const entry = await this.entriesRepository.findOne({
            where: [{ entryId: _entryId }],
        });
        return entry;
    }

    async getEntries(filter: GetFilterType): Promise<Entry[]> {
        switch (filter.dto) {
            case "FullDto":
                const fullModelEntries = await getData(
                    this.entriesRepository,
                    'entry',
                    filter,
                    [
                        { sourceField: 'entry.likes', targetTable: 'likes', condition: '' },
                        { sourceField: 'likes.user', targetTable: 'user', condition: '' },
                    ],
                    ['entry', 'likes', 'user.username', 'user.authLevel', 'user.firstName', 'user.lastName', 'user.profilePicture', 'user.gender']
                );
                return fullModelEntries;
            default:
                const entries = await getData(this.entriesRepository, "entry", filter);
                return entries;
        }
    }

    async createEntry(request: Request, entry: Entry, file: Express.Multer.File) {
        const randomId = generateRandomString(10);
        let fileUrl = "";
        if (file) {
            fileUrl = await uploadFile(this.configService.get<string>("entry_image_path"), file);
        }
        const currentDate: FormattedDateType = getFormattedDate();
        const entryReadyToBeInserted = Object.assign({}, entry, {
            entryId: randomId,
            content: entry.content.trim(),
            createDate: currentDate.fullDate,
            createTime: currentDate.fullTime,
            createdUser: request['user'].username,
            active: "true",
            contentImage: fileUrl,
        });

        try {
            const response = await this.entriesRepository.save(entryReadyToBeInserted);
            console.log(response)
        } catch (err) {
            console.log(err);
            throw new InternalServerErrorException();
        }
    }

    async updateEntry(request: Request, entry: Entry) {
        const existingEntry = await this.getSingleEntry(entry.entryId);
        const authVerified = await this.verifyAuth(request, existingEntry, Action.Update);
        if (!authVerified) throw new ForbiddenException();
        try {
            await this.entriesRepository.update({ entryId: entry.entryId }, entry);
        } catch {
            throw new NotFoundException();
        }
    }

    async deleteEntry(request: Request, _entryId: string) {
        const existingEntry = await this.getSingleEntry(_entryId);
        const authVerified = await this.verifyAuth(request, existingEntry, Action.Delete);
        if (!authVerified) throw new ForbiddenException();
        try {
            await this.entriesRepository.update({ entryId: _entryId }, { active: "false" });
        } catch {
            throw new NotFoundException();
        }
    }

    async verifyAuth(request: Request, entry: Entry, action: Action.Update | Action.Delete): Promise<boolean> {
        const ability = this.abilityFactory.defineAbility(request['user']);
        return ability.can(action, entry);
    }
}