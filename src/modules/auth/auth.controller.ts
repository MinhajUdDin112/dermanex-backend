import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Create a new user account with email, full name, and password',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration data',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        message: 'User registered successfully',
        email: 'user@example.com',
        full_name: 'John Doe',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or passwords do not match',
    schema: {
      example: {
        statusCode: 400,
        message: ['Email must be a valid email address'],
        error: 'Bad Request',
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user with email and password',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login data',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    schema: {
      example: {
        message: 'User logged in successfully',
        data: {
          id: 'uuid',
          email: 'user@example.com',
          full_name: 'John Doe',
          is_active: true,
        },
        token: {
          access_token: 'jwt_token_here',
          token_type: 'bearer',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid email or password',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid email or password',
        error: 'Bad Request',
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }
}
