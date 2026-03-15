import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current account password',
    example: 'OldPass123',
  })
  @IsString({ message: 'Current password must be a string' })
  current_password: string;

  @ApiProperty({
    description:
      'New password (minimum 8 characters, must contain uppercase, lowercase, and number)',
    example: 'NewPass123',
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message:
      'New password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  new_password: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'NewPass123',
  })
  @IsString({ message: 'Confirm new password must be a string' })
  confirm_new_password: string;
}
