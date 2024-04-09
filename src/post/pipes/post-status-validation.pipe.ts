import { BadRequestException, PipeTransform } from '@nestjs/common';
import { PostStatus } from '../types/poststatus-role.type';

export class PostStatusValidationPipe implements PipeTransform {
  readonly StatusOptions = [
    PostStatus.PUBLIC,
    PostStatus.SUBSCRIBER,
    PostStatus.PRIVATE,
  ];

  transform(value: any) {
    value = value.toUpperCase();

    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`${value}는 정확한상태가 아닙니다.`);
    }

    return value; // 값을 반환해야 합니다.
  }

  private isStatusValid(status: any) {
    const index = this.StatusOptions.indexOf(status);
    return index !== -1;
  }
}
