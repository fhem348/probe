import { IsNotEmpty, IsEnum } from 'class-validator';
import { Visibility, PostStatus } from '../types/poststatus-role.type';

export class CreatePostDto {
  @IsNotEmpty()
  image: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsEnum(Visibility)
  visible: Visibility;

  @IsEnum(PostStatus)
  role: PostStatus;
}
