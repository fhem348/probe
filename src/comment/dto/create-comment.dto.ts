import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: '내용읍서' })
  content: string;
}
