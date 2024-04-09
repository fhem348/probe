import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { SignUpDto } from './dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';

@Injectable()
export class AuthService {
  blacklist: any;
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  //회원가입서비스 - 이메일,비밀번호,비밀번호확인,닉네임,나이,프로필이미지
  async signUp({
    email,
    password,
    passwordConfirm,
    nickname,
    age,
    profileImage,
  }: SignUpDto) {
    const isPasswordMatched = password === passwordConfirm;
    if (!isPasswordMatched) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 서로 일치하지 않습니다.',
      );
    }

    const existedUser = await this.userRepository.findOneBy({ email });
    if (existedUser) {
      throw new BadRequestException('이미 가입 된 이메일 입니다.');
    }

    const hashRounds = this.configService.get<number>('PASSWORD_HASH_ROUNDS');
    const hashedPassword = bcrypt.hashSync(password, hashRounds);
    // const hashedPassword = await hash(password, 10);

    const user = await this.userRepository.save({
      email,
      password: hashedPassword,
      nickname,
      age,
      profileImage,
    });

    return this.signIn(user.id);
  }
  //로그인 서비스
  //로그인하면 jwt 엑세스토큰 발급
  signIn(userId: number) {
    const payload = { id: userId };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async validateUser({ email, password }: SignInDto) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, password: true },
    });
    const isPasswordMatched = bcrypt.compareSync(
      password,
      user?.password ?? '',
    );

    if (!user || !isPasswordMatched) {
      return null;
    }

    return { id: user.id };
  }

  addToBlacklist(token: string): void {
    this.blacklist.add(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }
}
