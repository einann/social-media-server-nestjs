import { User } from "src/users/user.entity";
import { Action, Subjects } from "../ability.factory";
import { RequiredRule } from "../abilities.decorator";

export class ReadUserAbility implements RequiredRule {
    action: Action = Action.Read;
    subject: User = new User();
}

export class CreateUserAbility implements RequiredRule {
    action: Action = Action.Create;
    subject: User = new User();
}

export class UpdateUserAbility implements RequiredRule {
    action: Action = Action.Update;
    subject: User = new User();
}