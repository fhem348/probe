import { PickType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/user/entities/user.entity';

export class SignUpDto extends PickType(User, [
  'email',
  'password',
  'nickname',
  'age',
  'profileImage',
]) {
  @IsNotEmpty({ message: '비밀번호 확인을 입력해 주세요.' })
  @IsString()
  passwordConfirm: string;

  @IsNotEmpty({ message: '닉네임을 입력해 주세요.' })
  @IsString()
  nickname: string;

  @IsInt()
  age: number;

  @IsString()
  profileImage: string;
}
