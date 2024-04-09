import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { Posts } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Posts)
    private readonly postRepository: Repository<Posts>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 코멘트 생성
  async createComment(
    createCommentDto: CreateCommentDto,
    user: User,
    postsId: number,
  ): Promise<Comment> {
    const { content } = createCommentDto;

    // postId를 사용하여 포스트를 조회
    const post = await this.postRepository.findOne({ where: { id: postsId } });

    if (!post) {
      throw new NotFoundException('포스트를 찾을 수 없습니다.');
    }

    const comment = this.commentRepository.create({
      content: content, // createCommentDto에서 content 가져오기
      user: user, // 사용자 객체 추가
      posts: post, // 포스트 객체 추가
    });

    // 코멘트 저장
    await this.commentRepository.save(comment);
    return comment;
  }

  findAll() {
    return `This action returns all comment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
