import { Entry } from "src/entries/entry.entity";

import { AppAbility } from "./ability.factory";
import { Action } from "./ability.factory";

export interface PolicyHandler {
    handle(ability: AppAbility): boolean;
}

export class ReadEntryHandler implements PolicyHandler {
    handle(ability: AppAbility): boolean {
        return ability.can(Action.Read, Entry);
    }
}