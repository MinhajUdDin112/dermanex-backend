import { ApiProperty } from '@nestjs/swagger';

export class SkinScanTimeOfDayDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: '2026-03-16T12:00:00.000Z' })
  scannedAt: Date;

  @ApiProperty({
    example: 'https://bucket.s3.amazonaws.com/skin-scans/123.jpg',
  })
  image_url: string;

  @ApiProperty({ example: 'morning', enum: ['morning', 'evening'] })
  timeOfDay: 'morning' | 'evening';

  @ApiProperty({ example: 78, nullable: true })
  skin_score: number | null;

  @ApiProperty({
    example: {
      acne: 0.2,
      wrinkles: 0.1,
      pigmentation: 0.05,
      eye_bags: 0.1,
      hydration: 0.7,
    },
    nullable: true,
  })
  metrics: Record<string, any> | null;

  @ApiProperty({
    example: [
      'Your skin is mostly clear and balanced.',
      'Fine lines visible. Consider retinol-based products.',
    ],
    isArray: true,
    nullable: true,
  })
  insights: string[] | null;

  @ApiProperty({
    example: [
      {
        step: 1,
        title: 'Cleanser',
        product: 'Gentle Cleanser',
        usage: '2 pumps',
        tags: ['Pure Base'],
        status: 'pending',
      },
      {
        step: 2,
        title: 'Toner',
        product: 'Hydrating Toner',
        usage: '3 drops',
        tags: ['Hydration Prep'],
        status: 'pending',
      },
    ],
    isArray: true,
    nullable: true,
  })
  ritual: Array<Record<string, any>> | null;

  @ApiProperty({ example: 0, nullable: true })
  progress: number | null;
}

export class LatestMorningEveningDto {
  @ApiProperty({ type: SkinScanTimeOfDayDto, nullable: true })
  morning: SkinScanTimeOfDayDto | null;

  @ApiProperty({ type: SkinScanTimeOfDayDto, nullable: true })
  evening: SkinScanTimeOfDayDto | null;
}
