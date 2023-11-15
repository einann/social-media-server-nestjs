import { Comment } from "src/comments/comment.entity";
import { Entry } from "src/entries/entry.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Likes {
    @Column()
    @PrimaryGeneratedColumn()
    id: string;

    @ManyToOne(() => User, user => user.likes)
    user: User;

    @ManyToOne(() => Entry, entry => entry.likes)
    entry: Entry;

    @ManyToOne(() => Comment, comment => comment.likes)
    comment: Comment;

    @Column()
    createDate: string;

    @Column()
    createTime: string;
}