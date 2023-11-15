import { User } from "src/users/user.entity";
import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn, Unique } from "typeorm";

@Entity()
@Unique(["following", "follower"])
export class FollowingList {
    @Column()
    @PrimaryColumn()
    id: string;

    @Column()
    createDate: string;

    @Column()
    createTime: string;

    @ManyToOne(() => User, user => user.username)
    following: User;

    @ManyToOne(() => User, user => user.username)
    follower: User;
}