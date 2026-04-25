import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordRequestDto,
  ResetPasswordDto,
  ConfirmOtpDto,
  VerifyRegistrationOtpDto,
} from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Create an unverified user account and send an OTP to verify the email',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration data',
  })
  @ApiResponse({
    status: 201,
    description: 'OTP sent to verify the email',
    schema: {
      example: {
        message: 'OTP has been sent to verify the email.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or email already registered',
    schema: {
      example: {
        statusCode: 400,
        message: 'Email already registered',
        error: 'Bad Request',
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('verify-registration-otp')
  @ApiOperation({
    summary: 'Verify registration OTP',
    description:
      'Verify the OTP sent during registration, mark email as verified and return access token',
  })
  @ApiBody({
    type: VerifyRegistrationOtpDto,
    description: 'Email and OTP to verify registration',
  })
  @ApiResponse({
    status: 200,
    description: 'User registered successfully',
    schema: {
      example: {
        message: 'User registered successfully',
        data: {
          id: 'uuid',
          email: 'user@example.com',
          full_name: 'John Doe',
          is_active: true,
          is_email_verified: true,
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
    description: 'Invalid or expired OTP',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid or expired OTP',
        error: 'Bad Request',
      },
    },
  })
  async verifyRegistrationOtp(
    @Body() verifyRegistrationOtpDto: VerifyRegistrationOtpDto,
  ) {
    return await this.authService.verifyRegistrationOtp(
      verifyRegistrationOtpDto,
    );
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

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request password reset OTP',
    description: 'Send a one-time password (OTP) to the user email',
  })
  @ApiBody({
    type: ForgotPasswordRequestDto,
    description: 'Email to receive OTP',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP request processed',
    schema: {
      example: {
        message:
          'If the email exists, an OTP has been sent to reset the password.',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Email service not configured or failed to send',
    schema: {
      example: {
        statusCode: 500,
        message: 'Failed to send email',
        error: 'Internal Server Error',
      },
    },
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordRequestDto) {
    return await this.authService.requestPasswordResetOtp(forgotPasswordDto);
  }

  @Post('confirm-otp')
  @ApiOperation({
    summary: 'Confirm password reset OTP',
    description: 'Verify OTP before resetting password',
  })
  @ApiBody({
    type: ConfirmOtpDto,
    description: 'Email and OTP to verify',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    schema: {
      example: {
        message: 'OTP verified successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid or expired OTP',
        error: 'Bad Request',
      },
    },
  })
  async confirmOtp(@Body() confirmOtpDto: ConfirmOtpDto) {
    return await this.authService.confirmOtp(confirmOtpDto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password with OTP',
    description: 'Verify OTP and set a new password',
  })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'OTP and new password data',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      example: {
        message: 'Password reset successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid OTP or password validation failed',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid or expired OTP',
        error: 'Bad Request',
      },
    },
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPasswordWithOtp(resetPasswordDto);
  }
}
