import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ProductService } from './services/product.service';
import { ScanBarcodeDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../user/entity/user.entity';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('Product Analysis')
@Controller('products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly productService: ProductService) {}

  @Post('scan')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Analyze scanned product barcode',
    description:
      'Send scanned barcode ID to get product analysis with ingredients and compatibility alerts',
  })
  @ApiResponse({
    status: 200,
    description: 'Product analysis result with score and alerts',
    schema: {
      example: {
        productId: 'uuid',
        productName: 'Niacinamide 10% + Zinc 1%',
        brand: 'The Ordinary',
        productCategory: 'Serums',
        barcode: '5054614916012',
        imageUrl: 'https://example.com/image.jpg',
        compatibilityScore: 75,
        compatibilityAlerts: [
          {
            severity: 'warning',
            message: 'May interact with BHAs - introduce gradually',
            ingredient: 'Niacinamide',
          },
        ],
        ingredientAnalysis: [
          {
            name: 'Niacinamide',
            safetyLevel: 'SAFE',
            benefits: ['Reduces redness', 'Oil control', 'Strengthens barrier'],
            concerns: ['May irritate sensitive skin'],
            avoidWith: ['High pH products'],
          },
          {
            name: 'Zinc PCA',
            safetyLevel: 'SAFE',
            benefits: ['Oil control', 'Antimicrobial'],
            concerns: [],
          },
        ],
        labels: ['cruelty-free', 'vegan'],
        aiInsights: {
          summary:
            'Lightweight serum with niacinamide and zinc for oily/combination skin...',
          recommendations: ['Use once daily', 'Follow with moisturizer'],
          ritualCompatibility: 'Works in AM/PM routines',
        },
      },
    },
  })
  async scanBarcode(
    @Body() scanBarcodeDto: ScanBarcodeDto,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.productService.scanBarcode(
        scanBarcodeDto.barcode,
        user?.id,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in scanBarcode: ${errorMessage}`);
      throw error;
    }
  }
}
