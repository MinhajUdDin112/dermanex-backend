import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateRitualStepDto {
  @ApiProperty({
    example: 1,
    description: 'Step number to mark as completed',
  })
  @IsInt()
  @Min(1)
  step: number;
}
