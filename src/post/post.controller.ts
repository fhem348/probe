import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Patch,
  HttpStatus,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { userInfo } from 'src/utils/userInfo.decorator';
import { UpdatePostDto } from './dtos/update-post.dto';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(ValidationPipe)
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @userInfo() user: User,
  ): Promise<any> {
    const post = await this.postService.createPost(createPostDto, user);
    return {
      statusCode: HttpStatus.OK,
      message: '게시물 생성에 성공했습니다.',
      data: post,
    };
  }

  @Get()
  async getPosts(@userInfo() user: User): Promise<any> {
    const posts = await this.postService.getPosts(user);

    return {
      statusCode: HttpStatus.OK,
      message: '게시물 목록 조회에 성공했습니다.',
      data: posts,
    };
  }
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getPostById(
    @Param('id') id: string,
    @userInfo() user?: User,
  ): Promise<any> {
    const postId = Number(id);
    const posts = await this.postService.getPostById(postId, user);
    return {
      statusCode: HttpStatus.OK,
      message: '게시물 조회에 성공했습니다.',
      data: posts,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  @UsePipes(ValidationPipe)
  async updatePost(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @userInfo() user: User,
  ): Promise<any> {
    const updatedPost = await this.postService.updatePost(
      id,
      updatePostDto,
      user,
    );
    return {
      statusCode: HttpStatus.OK,
      message: '게시물 수정에 성공했습니다.',
      data: updatedPost,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deletePost(
    @Param('id') id: number,
    @userInfo() user: User,
  ): Promise<any> {
    await this.postService.deletePost(id, user);
    return {
      statusCode: HttpStatus.OK,
      message: '게시물 삭제에 성공했습니다.',
    };
  }
}
