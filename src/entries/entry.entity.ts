import { Comment } from "src/comments/comment.entity";
import { Likes } from "src/likes/likes.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class Entry {
    @Column()
    @PrimaryColumn()
    entryId: string;

    @Column()
    content: string;

    @Column()
    createDate: string;

    @Column()
    createTime: string;

    @Column()
    createdUser: string;

    @Column()
    active: string;

    @Column()
    contentImage: string;

    @OneToMany(() => Likes, likes => likes.entry)
    likes: Likes[];

    @OneToMany(() => Comment, comment => comment.parentId)
    comments: Comment[];
}