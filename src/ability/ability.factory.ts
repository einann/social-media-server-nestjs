import { AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects, MongoAbility, createMongoAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { Comment } from "src/comments/comment.entity";
import { Entry } from "src/entries/entry.entity";
import { FollowingList } from "src/following_list/following_list.entity";
import { User } from "src/users/user.entity";

export enum Action {
    Manage = 'manage',
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete',
}

export type Subjects = InferSubjects<typeof User | typeof Entry | typeof Comment | typeof FollowingList> | 'all';
export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
    defineAbility(user: User) {
        // define rules
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

        if (user.authLevel === "admin") {
            can(Action.Manage, 'all');
        } else {
            can(Action.Read, User);
            can(Action.Create, User);
            can(Action.Update, User, { username: { $eq: user.username } });
            can(Action.Delete, User, { username: { $eq: user.username } });

            can(Action.Update, Entry, { createdUser: { $eq: user.username } });
            can(Action.Delete, Entry, { createdUser: { $eq: user.username } });

            can(Action.Delete, Comment, { createdUser: { $eq: user.username } });
        }

        return build({
            detectSubjectType: (item) =>    // Hangi subject olduğunu tespit ediyor. Mesela can(Action.Read, User) yazarsak User'ı tespit etmek için.
                item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}