import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RegisterDto, LoginDto } from './dto';
import { User } from '../user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, full_name, password, confirm_password } = registerDto;

    // Validate passwords match
    if (password !== confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const saltRounds = 10;
    const hashed_password = await bcrypt.hash(password, saltRounds);

    // TODO: Create user in database
    let user = await this.userRepository.create({
      email,
      full_name,
      hashed_password,
    });

    user = await this.userRepository.save(user);

    const accessToken = await this.generateTokens(user.id, user.email);
    const token = {
      access_token: accessToken.accessToken,
      token_type: 'bearer',
    };

    return {
      message: 'User registered successfully',
      data: user,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || !user.hashed_password) {
      throw new BadRequestException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.hashed_password,
    );
    if (!passwordMatches) {
      throw new BadRequestException('Invalid email or password');
    }

    const accessToken = await this.generateTokens(user.id, user.email);
    const token = {
      access_token: accessToken.accessToken,
      token_type: 'bearer',
    };

    return {
      message: 'User logged in successfully',
      data: user,
      token,
    };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { id: userId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });

    return { accessToken };
  }
}
