import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { DeleteUserDto } from './dtos/delete-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { userInfo } from 'src/utils/userInfo.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMe(@userInfo() user: User) {
    const data = await this.userService.findOneById(user);

    return {
      statusCode: HttpStatus.OK,
      message: '내 정보 조회에 성공했습니다.',
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findUserById(id);
    return {
      statusCode: HttpStatus.OK,
      message: '사용자 조회에 성공했습니다.',
      data: user,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @userInfo() user: User,
  ) {
    const updatedUser = await this.userService.updateUser(
      user.id,
      updateUserDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: '내 정보 수정에 성공했습니다.',
      data: updatedUser,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteUser(
    @userInfo() user: User,
    @Body() deleteUserDto: DeleteUserDto,
  ) {
    await this.userService.deleteUser(user, deleteUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: '회원 탈퇴에 성공했습니다.',
    };
  }
}
