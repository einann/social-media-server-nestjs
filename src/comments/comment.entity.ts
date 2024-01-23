import { Entry } from "src/entries/entry.entity";
import { Likes } from "src/likes/likes.entity";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class Comment {
    @Column()
    @PrimaryColumn()
    commentId: string;
    
    @ManyToOne(() => Entry, entries => entries.comments)
    parentId: Entry;

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

    @OneToMany(() => Likes, likes => likes.comment)
    likes: Likes[];
}