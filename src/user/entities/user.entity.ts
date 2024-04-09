import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserRole } from '../types/user-role.type';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Posts } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty({ message: '이메일을 입력해 주세요.' })
  @IsEmail()
  @Column({ unique: true })
  email: string;

  @IsString()
  @IsStrongPassword(
    { minLength: 8, minNumbers: 1, minSymbols: 1 },
    {
      message:
        '비밀번호는 영문 알파벳 대,소문자, 숫자, 특수문자를 포함해서 8자리 이상으로 입력해야 합니다.',
    },
  )
  @IsNotEmpty({
    message:
      '비밀번호는 영문 알파벳 대,소문자, 숫자, 특수문자를 포함해서 8자리 이상으로 입력해야 합니다.',
  })
  @Column({ select: false })
  password: string;

  @IsNotEmpty({ message: '닉네임은 비워 둘 수 없습니다.' })
  @IsString()
  @Column()
  nickname: string;

  @Column()
  age: number;

  @Column()
  profileImage: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.User })
  role: UserRole;

  @IsNumber()
  @Column() //{ unsigned: true }
  points: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => Posts, (posts) => posts.user)
  posts: Posts[];

  @OneToMany(() => Comment, (comments) => comments.user)
  comments: Comment[];
}
