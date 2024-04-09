import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dtos/create-post.dto';
import { Posts } from './entities/post.entity';
import { User } from '../user/entities/user.entity';
import { UpdatePostDto } from './dtos/update-post.dto';
import { PostStatus, Visibility } from './types/poststatus-role.type';
import { GetPostDto } from './dtos/getId-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Posts)
    private readonly postsRepository: Repository<Posts>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createPost(createPostDto: CreatePostDto, user: User): Promise<Posts> {
    const { image, title, content, visible, role } = createPostDto;
    // const { id } = user;
    // const user = await this.validateUser(userId);

    const post = this.postsRepository.create({
      image,
      title,
      content,
      visible,
      role,
      like: 0,
      user: user,
    });

    await this.postsRepository.save(post);
    return post;
  }

  private async validateUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException('유효하지 않은 사용자입니다.');
    }
    return user;
  }

  async getPosts(user?: User): Promise<
    {
      id: number;
      image: string;
      title: string;
      userNickname: string;
      userProfileImage: string;
    }[]
  > {
    let query = this.postsRepository
      .createQueryBuilder('post')
      .select([
        'post.id',
        'post.image',
        'post.title',
        'user.nickname AS userNickname',
        'user.profileImage AS userProfileImage',
      ])
      .leftJoin('post.user', 'user')
      .where('post.role = :public', { public: PostStatus.PUBLIC }); // 기본적으로 전체 공개 포스트만 선택

    // 사용자 인증 정보가 있는 경우 추가적인 필터링 적용
    if (user) {
      query = query.orWhere('1 = 0'); // 이미 전체 공개 포스트는 위에서 선택되었으므로, 이 조건은 추가적인 필터링을 위한 기본 설정

      // 어드민인 경우 모든 포스트 조회 가능
      if (user.role === 'Admin') {
        query = query.orWhere('1 = 1'); // 모든 조건을 만족하는 포스트 선택
      } else {
        // 20세 이상 유저만 성인 포스트 조회 가능
        if (user.age > 20) {
          query = query.orWhere('post.visibility = :r18', {
            r18: Visibility.R18,
          });
        }

        // 일반 포스트 조회
        query = query.orWhere('post.visibility = :all', {
          all: Visibility.ALL,
        });

        // 구독자 전용 포스트는 포인트를 소모해야 볼 수 있음
        if (user.points > 0) {
          query = query.orWhere('post.role = :subscriber', {
            subscriber: PostStatus.SUBSCRIBER,
          });
        }

        // 비공개 포스트는 작성자만 조회 가능
        query = query.orWhere(
          'post.role = :private AND post.user.id = :userId',
          { private: PostStatus.PRIVATE, userId: user.id },
        );
      }
    }

    return query.getRawMany();
  }

  async getPostById(id: number, user?: User): Promise<GetPostDto> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException(`게시물을 찾을 수 없습니다`);
    }

    // 로그인하지 않았거나, 포스트가 성인용이며 사용자가 미성년자인 경우 - 전혀 작동안함
    if (post.visible === Visibility.R18 && (!user || user.age <= 20)) {
      throw new NotFoundException(`미성년자는 이 콘텐츠를 볼 수 없습니다.`);
    }

    // 비공개 포스트이며, 사용자가 포스트의 소유자가 아닌 경우 -유일하게 잘작동
    if (
      post.role === PostStatus.PRIVATE &&
      (!user || post.user.id !== user.id)
    ) {
      throw new NotFoundException(`이 포스트는 비공개입니다.`);
    }

    // 어드민이거나 포스트의 소유자인 경우, 그 외의 접근 제한이 없거나 만족하는 경우 포스트 반환
    if (user && (user.role === 'Admin' || post.user.id === user.id)) {
      return this.mapToDto(post);
    }

    // 공개 포스트인 경우
    if (post.visible === Visibility.ALL) {
      return this.mapToDto(post);
    }

    // 위의 모든 조건에 해당하지 않는 경우, 포스트 접근 권한이 없는 것으로 간주
    throw new NotFoundException(`이 포스트에 대한 접근 권한이 없습니다.`);
  }

  private mapToDto(post: Posts): GetPostDto {
    return {
      id: post.id,
      image: post.image,
      title: post.title,
      content: post.content,
      visible: post.visible,
      role: post.role,
      like: post.like,
      userNickname: post.user.nickname,
      userProfileImage: post.user.profileImage,
    };
  }

  async updatePost(
    id: number,
    updatePostDto: UpdatePostDto,
    user: User,
  ): Promise<Posts> {
    const { image, title, content, visible, role } = updatePostDto;
    const findPost = await this.postsRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!findPost) {
      throw new NotFoundException('해당 ID의 게시글을 찾을 수 없습니다.');
    }

    return await this.postsRepository.save({
      id,
      image,
      title,
      content,
      visible,
      role,
    });
  }

  async deletePost(id: number, user: User): Promise<void> {
    const post = await this.postsRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!post) {
      throw new NotFoundException(
        `해당 ID의 게시글을 찾을 수 없거나 삭제 권한이 없습니다.`,
      );
    }

    await this.postsRepository.remove(post);
  }
}

// {
//   "image": "포스트 이미지 URL",
//   "title": "포스트 제목",
//   "content": "포스트 내용",
//   "visible": "ALL 또는 R18",
//   "role": "PUBLIC, SUBSCRIBER PRIVATE"
// }
// @Injectable()
// export class PostService {
//   constructor(
//     @InjectRepository(Posts)
//     private readonly postsRepository: Repository<Posts>,
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,
//   ) {}

//   async createPost(
//     createPostDto: CreatePostDto,
//     userId: number,
//   ): Promise<Posts> {
//     const { image, title, content, visible, role, like } = createPostDto;

//     const user = await this.validateUser(userId);
//     this.validatePostVisibility(user.age, visible);

//     const post = this.postsRepository.create({
//       image,
//       title,
//       content,
//       visible,
//       role,
//       like,
//       user: { id: userId },
//     });

//     await this.postsRepository.save(post);
//     return post;
//   }

//   private async validateUser(userId: number): Promise<User> {
//     // userId 타입을 number로 변경
//     const user = await this.userRepository.findOneBy({ id: userId });
//     if (!user) {
//       throw new BadRequestException('유효하지 않은 사용자입니다.');
//     }
//     return user;
//   }

//   private validatePostVisibility(userAge: number, visible: Visibility) {
//     if (userAge < 18 && visible === Visibility.R18) {
//       throw new BadRequestException('미성년자는 R-18 컨텐츠를 볼 수 없습니다.');
//     }
//   }

//   async getPostById(id: number): Promise<Posts> {
//     const found = await this.postsRepository.findOneBy({ id }); // findOneBy 대신 findOne으로 변경

//     if (!found) {
//       throw new NotFoundException(`존재하지 않거나 삭제된 게시글입니다.`);
//     }
//     return found;
//   }
// }
