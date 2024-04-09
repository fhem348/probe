import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsOptional,
} from 'class-validator';
import { UserRole } from '../types/user-role.type';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty({ message: '이름은 비워 둘 수 없습니다.' })
  @IsOptional()
  nickname?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsNotEmpty({ message: '나이를 입력해주세요.' })
  @IsOptional()
  age?: number;

  @ApiProperty({ required: false })
  @IsString()
  profileImage?: string;

  @ApiProperty({ required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
