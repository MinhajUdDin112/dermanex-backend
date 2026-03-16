import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkinAiService } from './skin-ai.service';

@ApiTags('skin-ai')
@Controller('skin-ai')
export class SkinAiController {
  constructor(private readonly skinAiService: SkinAiService) {}

  @Post('predict')
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
        model: 'densenet',
        predictions: [
          { label: 'acne', probability: 0.45642799139022827 },
          { label: 'dark spots', probability: 0.3984789550304413 },
          { label: 'normal skin', probability: 0.08577688038349152 },
          { label: 'puffy eyes', probability: 0.056703899055719376 },
          { label: 'wrinkles', probability: 0.0026123858988285065 },
        ],
        top_label: 'acne',
      },
    },
  })
  async predictSkin(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          //   new FileTypeValidator({ fileType: 'image/(jpeg|png)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.skinAiService.predict(file);
  }
}
