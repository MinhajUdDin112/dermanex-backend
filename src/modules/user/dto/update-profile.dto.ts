import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  full_name?: string;

  @ApiPropertyOptional({
    description: 'Short user bio',
    example: 'Skincare enthusiast and product tester.',
  })
  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  @MaxLength(280, { message: 'Bio must not exceed 280 characters' })
  bio?: string;
}
