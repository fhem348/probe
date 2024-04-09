import { PostStatus, Visibility } from '../types/poststatus-role.type';

export class GetPostDto {
  id: number;
  image: string;
  title: string;
  content: string;
  visible: Visibility;
  role: PostStatus;
  like: number;
  userNickname: string;
  userProfileImage: string;
}
