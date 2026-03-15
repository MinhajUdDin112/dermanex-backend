import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Patch,
  ParseFilePipe,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserService } from './user.service';
import {
  ChangePasswordDto,
  SaveSkinGoalsDto,
  UpdateProfileDto,
  UserInfoDto,
} from './dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get current user info',
    description: 'Fetch the authenticated user profile data',
  })
  @ApiResponse({
    status: 200,
    description: 'User info fetched successfully',
    type: UserInfoDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async getMe(@Req() req: any): Promise<UserInfoDto> {
    return this.userService.getUserInfo(req.user?.id);
  }

  @Put('profile-picture')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload or replace profile picture' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profilePicture: {
          type: 'string',
          format: 'binary',
          description: 'New profile picture',
        },
      },
      required: ['profilePicture'],
    },
  })
  async uploadProfilePicture(
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '\.(jpg|jpeg|png)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.userService.updateProfilePicture(
      req.user.id,
      file,
    );
    return {
      message: 'Profile picture updated successfully',
      url: result.profilePicture,
    };
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update the authenticated user name and bio',
  })
  @ApiBody({
    type: UpdateProfileDto,
    description: 'Profile fields to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      example: {
        message: 'Profile updated successfully',
        data: {
          id: 'uuid',
          email: 'user@example.com',
          full_name: 'John Doe',
          bio: 'Skincare enthusiast and product tester.',
          is_active: true,
          profilePicture: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async updateProfile(@Req() req: any, @Body() body: UpdateProfileDto) {
    return this.userService.updateProfile(req.user?.id, body);
  }

  @Patch('change-password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Change password',
    description:
      'Update the authenticated user password by providing current and new password',
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Password change data',
  })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
    schema: {
      example: {
        message: 'Password updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or invalid password',
    schema: {
      example: {
        statusCode: 400,
        message: 'Current password is incorrect',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async changePassword(@Req() req: any, @Body() body: ChangePasswordDto) {
    return this.userService.changePassword(req.user?.id, body);
  }

  @Patch('skin-goals')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Save skin goals and complete onboarding',
    description:
      'Save selected skin goals for the authenticated user and set isOnboarded to true',
  })
  @ApiBody({
    type: SaveSkinGoalsDto,
    description: 'Selected skin goals',
  })
  @ApiResponse({
    status: 200,
    description: 'Skin goals saved successfully',
    schema: {
      example: {
        message: 'Skin goals saved successfully',
        data: {
          id: 'uuid',
          email: 'user@example.com',
          full_name: 'John Doe',
          bio: 'Skincare enthusiast and product tester.',
          is_active: true,
          isOnboarded: true,
          skinGoals: ['clear_acne', 'enhance_glow'],
          profilePicture: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    schema: {
      example: {
        statusCode: 400,
        message: ['goals must contain at least one item'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async saveSkinGoals(@Req() req: any, @Body() body: SaveSkinGoalsDto) {
    return this.userService.saveSkinGoals(req.user?.id, body);
  }
}
