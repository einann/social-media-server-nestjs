import { Module } from '@nestjs/common';
import { AbilityFactory } from './ability.factory';

// Başka modüllerde (mesela UserModule) kullanabilmek (imports) için buradan export ediyoruz factory'yi.
@Module({
    providers: [AbilityFactory],
    exports: [AbilityFactory],
})
export class AbilityModule {}
