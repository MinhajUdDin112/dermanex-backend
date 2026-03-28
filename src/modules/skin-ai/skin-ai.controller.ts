import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Get,
  Req,
  UnauthorizedException,
  NotFoundException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkinAiService } from './skin-ai.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Request } from 'express';
import { LatestMorningEveningDto } from './dto/latest-time-of-day-scan.dto';

@ApiTags('skin-ai')
@Controller('skin-ai')
export class SkinAiController {
  constructor(private readonly skinAiService: SkinAiService) {}

  @Post('predict')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Analyze a skin image with the AI model' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file to analyze',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Prediction result from the AI model',
    schema: {
      example: {
        id: 'uuid',
        scannedAt: '2026-03-16T12:00:00.000Z',
        image_url: 'https://bucket.s3.amazonaws.com/skin-scans/123.jpg',
        confidence: 45.64,
        inflammation: 'low',
        model: 'densenet',
        predictions: [
          { label: 'acne', percentage: 45.64 },
          { label: 'dark spots', percentage: 39.85 },
        ],
        top_label: 'acne',
      },
    },
  })
  async predictSkin(
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
          //   new FileTypeValidator({ fileType: 'image/(jpeg|png)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.skinAiService.predict(file, userId);
  }

  @Get('latest-scan')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get latest skin prediction',
    description: 'Fetch the most recent prediction for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Latest prediction',
    schema: {
      example: {
        id: 'uuid',
        scannedAt: '2026-03-16T12:00:00.000Z',
        image_url: 'https://bucket.s3.amazonaws.com/skin-scans/123.jpg',
        confidence: 45.64,
        inflammation: 'low',
        model: 'densenet',
        predictions: [
          { label: 'acne', percentage: 45.64 },
          { label: 'dark spots', percentage: 39.85 },
        ],
        top_label: 'acne',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No prediction found',
    schema: {
      example: {
        statusCode: 404,
        message: 'No prediction found',
        error: 'Not Found',
      },
    },
  })
  async getLatest(@Req() req: any) {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    const latest = await this.skinAiService.getLatestPrediction(userId);
    if (!latest) {
      throw new NotFoundException('No prediction found');
    }

    return latest;
  }

  @Get('dashboard')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get latest morning and evening scans',
    description:
      'Fetch the most recent morning scan and evening scan for the authenticated user',
  })
  @ApiOkResponse({
    description: 'Latest morning and evening scans',
    type: LatestMorningEveningDto,
  })
  async getLatestMorningEvening(@Req() req: any) {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.skinAiService.getLatestByTimeOfDay(userId);
  }
}
