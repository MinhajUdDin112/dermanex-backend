import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { Repository } from 'typeorm';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordRequestDto,
  ResetPasswordDto,
  ConfirmOtpDto,
} from './dto';
import { User } from '../user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/common/services/email.service';
import { buildResetOtpEmail } from 'src/common/utils/email-templates';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
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

  async requestPasswordResetOtp(dto: ForgotPasswordRequestDto) {
    const { email } = dto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return {
        message:
          'If the email exists, an OTP has been sent to reset the password.',
      };
    }

    const otp = this.generateOtp(6);
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = this.getOtpExpiryDate();

    user.reset_password_otp_hash = otpHash;
    user.reset_password_otp_expires_at = expiresAt;
    await this.userRepository.save(user);

    const { subject, html, text } = buildResetOtpEmail({
      otp,
      expiresInMinutes: this.getOtpExpiryMinutes(),
    });

    await this.emailService.sendMail({
      to: email,
      subject,
      html,
      text,
    });

    return {
      message:
        'If the email exists, an OTP has been sent to reset the password.',
    };
  }

  async resetPasswordWithOtp(dto: ResetPasswordDto) {
    const { email, otp, new_password, confirm_password } = dto;

    if (new_password !== confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || !user.reset_password_otp_hash) {
      throw new BadRequestException('Invalid email or OTP');
    }

    const expiresAt = user.reset_password_otp_expires_at;
    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      user.reset_password_otp_hash = null;
      user.reset_password_otp_expires_at = null;
      await this.userRepository.save(user);
      throw new BadRequestException('Invalid or expired OTP');
    }

    const otpMatches = await bcrypt.compare(otp, user.reset_password_otp_hash);
    if (!otpMatches) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.hashed_password = hashedPassword;
    user.reset_password_otp_hash = null;
    user.reset_password_otp_expires_at = null;
    await this.userRepository.save(user);

    return {
      message: 'Password reset successfully',
    };
  }

  async confirmOtp(dto: ConfirmOtpDto) {
    const { email, otp } = dto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || !user.reset_password_otp_hash) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const expiresAt = user.reset_password_otp_expires_at;
    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      user.reset_password_otp_hash = null;
      user.reset_password_otp_expires_at = null;
      await this.userRepository.save(user);
      throw new BadRequestException('Invalid or expired OTP');
    }

    const otpMatches = await bcrypt.compare(otp, user.reset_password_otp_hash);
    if (!otpMatches) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return {
      message: 'OTP verified successfully',
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

  private generateOtp(length: number): string {
    const max = 10 ** length;
    return randomInt(0, max).toString().padStart(length, '0');
  }

  private getOtpExpiryMinutes(): number {
    const minutes = Number(this.configService.get('OTP_EXPIRES_MINUTES'));
    return Number.isFinite(minutes) && minutes > 0 ? minutes : 10;
  }

  private getOtpExpiryDate(): Date {
    const minutes = this.getOtpExpiryMinutes();
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}
