import { Exclude } from 'class-transformer';
import { Likes } from 'src/likes/likes.entity';
import { Token } from 'src/token/entities/token.entity';
import { Entity, Column, PrimaryColumn, Unique, OneToMany, ManyToMany, OneToOne } from 'typeorm';

// Veri tabanı seviyesinde doğrulama
@Entity()
@Unique(['email'])
export class User {
  @Column({ length: 25 })
  @PrimaryColumn()
  username: string;

  @Column()
  active: string;

  @Column({ nullable: true })
  authLevel: string;

  @Column({ length: 25 })
  firstName: string;

  @Column({ length: 25 })
  lastName: string;

  @Column('date')
  birthday: Date;

  @Column({ length: 50 })
  email: string;

  @Exclude()  // Kullanıcıya alanları dönerken Exclude alanları dönmüyor.
  @Column({ length: 300 })
  password: string

  @Column({ nullable: true })
  profilePicture: string

  @Column({ length: 8, nullable: true })
  signupDate: string;

  @Column({ length: 8, nullable: true })
  lastLoginDate: string;

  @Column()
  gender: string;

  @Column()
  verified: string;

  @OneToMany(() => Likes, likes => likes.user)
  likes: Likes[];
}