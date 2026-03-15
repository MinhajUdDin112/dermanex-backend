import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { ChangePasswordDto, UpdateProfileDto, UserInfoDto } from './dto';
import { S3Service } from 'src/common/services/s3.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly s3Service: S3Service,
  ) {}

  async getUserInfo(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { hashed_password, ...userData } = user;

    return {
      msg: 'User info fetched successfully',
      data: userData,
    };
  }

  async updateProfilePicture(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (file) {
      try {
        if (user.profilePicture) {
          await this.s3Service.deleteFile(user.profilePicture);
        }
        const pictureUrl = await this.s3Service.uploadFile(
          file,
          'profile-pictures',
        );
        user.profilePicture = pictureUrl;
        await this.userRepository.save(user);
      } catch (err) {
        // this.logger.error(`Failed to upload profile picture: ${err.message}`);
        throw new BadRequestException('Failed to process profile picture');
      }
    }
    return {
      message: 'Profile picture updated',
      profilePicture: user.profilePicture,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.full_name !== undefined) {
      user.full_name = dto.full_name;
    }
    if (dto.bio !== undefined) {
      user.bio = dto.bio;
    }

    const saved = await this.userRepository.save(user);
    const { hashed_password, ...userData } = saved;

    return {
      message: 'Profile updated successfully',
      data: userData,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.hashed_password) {
      throw new BadRequestException('Password not set for this account');
    }

    if (dto.new_password !== dto.confirm_new_password) {
      throw new BadRequestException('Passwords do not match');
    }

    const matches = await bcrypt.compare(
      dto.current_password,
      user.hashed_password,
    );
    if (!matches) {
      throw new BadRequestException('Current password is incorrect');
    }

    const saltRounds = 10;
    user.hashed_password = await bcrypt.hash(dto.new_password, saltRounds);
    await this.userRepository.save(user);

    return {
      message: 'Password updated successfully',
    };
  }
}
