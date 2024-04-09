import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dtos/update-user.dto';
import { DeleteUserDto } from './dtos/delete-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findOneById(user: User) {
    const { id } = user;
    const foundUser = await this.userRepository.findOne({
      where: { id },
      relations: ['posts'],
    });

    if (!foundUser) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const posts = foundUser.posts.map((post) => ({
      id: post.id,
      image: post.image,
      title: post.title,
    }));

    return {
      ...foundUser,
      posts,
    };
  }

  async findUserById(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const uuser = await this.userRepository.findOneBy({ id });

    if (!uuser) {
      throw new NotFoundException('Authentication information is missing');
    }

    const { nickname, profileImage, age, role } = updateUserDto;
    return await this.userRepository.save({
      id,
      nickname,
      profileImage,
      age,
      role,
    });
  }

  async deleteUser(user: User, deleteUserDto: DeleteUserDto) {
    const { id } = user;
    const { password } = deleteUserDto;
    const uuser = await this.userRepository.findOne({
      select: ['password'],
      where: { id },
    });
    if (!uuser) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    const isPasswordMatched = bcrypt.compareSync(password, uuser.password);
    if (!isPasswordMatched) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    await this.userRepository.delete({ id });
  }
}
