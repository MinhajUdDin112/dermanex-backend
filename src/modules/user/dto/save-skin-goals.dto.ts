import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsEnum } from 'class-validator';

export enum SkinGoal {
  CLEAR_ACNE = 'clear_acne',
  ENHANCE_GLOW = 'enhance_glow',
  ANTI_AGING = 'anti_aging',
  RESTORE_BARRIER = 'restore_barrier',
  TARGET_PIGMENTATION = 'target_pigmentation',
}

export class SaveSkinGoalsDto {
  @ApiProperty({
    description: 'Selected skin goals for the user',
    isArray: true,
    // enum: SkinGoal,
    example: [SkinGoal.CLEAR_ACNE, SkinGoal.ENHANCE_GLOW],
  })
  @IsArray({ message: 'goals must be an array' })
  @ArrayNotEmpty({ message: 'goals must contain at least one item' })
  @ArrayUnique({ message: 'goals must be unique' })
  // @IsEnum(SkinGoal, { each: true, message: 'Invalid goal value' })
  goals: SkinGoal[];
}
