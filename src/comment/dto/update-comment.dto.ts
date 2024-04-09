import { PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @IsNotEmpty({ message: '내용읍서' })
  content: string;
}
