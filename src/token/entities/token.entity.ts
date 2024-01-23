import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Token {
    @Column()
    @PrimaryColumn()
    username: string; 

    @Column()
    email: string;

    @Column({ nullable: true })
    resetToken: string;

    @Column({ nullable: true })
    verifyToken: string;

    @Column()
    createDate: string;

    @Column()
    createTime: string;

    @Column({ type: 'timestamp' })
    expireDate: Date;
}