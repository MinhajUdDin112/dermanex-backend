import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe', nullable: true })
  full_name: string | null;

  @ApiProperty({ example: 'Skincare enthusiast and product tester.', nullable: true })
  bio: string | null;

  @ApiProperty({ example: 'https://cdn.example.com/profile.jpg', nullable: true })
  profilePicture: string | null;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: false })
  isOnboarded: boolean;

  @ApiProperty({
    example: ['clear_acne', 'enhance_glow'],
    isArray: true,
  })
  skinGoals: string[];

  @ApiProperty({ example: '2026-03-14T07:55:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-03-14T07:55:00.000Z' })
  updatedAt: Date;
}
