import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenBeautyFactsService {
  private readonly logger = new Logger(OpenBeautyFactsService.name);
  private readonly BASE_URL = 'https://world.openbeautyfacts.org/api/v0';

  async getProductByBarcode(barcode: string) {
    try {
      this.logger.debug(
        `Fetching product from Open Beauty Facts for barcode: ${barcode}`,
      );

      const response = await axios.get(`${this.BASE_URL}/product/${barcode}`, {
        headers: {
          'User-Agent': 'DermaNextApp/1.0',
        },
      });

      if (response.data.status !== 1) {
        this.logger.warn(`Product not found for barcode: ${barcode}`);
        return null;
      }

      return this.parseProductData(response.data.product);
    } catch (error: any) {
      this.logger.error(
        `Error fetching from Open Beauty Facts: ${error.message}`,
      );
      throw new HttpException(
        'Failed to fetch product data from Open Beauty Facts',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private parseProductData(product: any) {
    const ingredients = (product.ingredients_text || '')
      .split(/[,;]/)
      .map((ing: string) => ing.trim())
      .filter((ing: string) => ing.length > 0);

    return {
      barcode: product.code || product.id,
      productName: product.product_name || 'Unknown Product',
      brand: product.brands || 'Unknown Brand',
      productCategory: product.categories || product.category || 'Cosmetics',
      description: product.generic_name || product.nutrition_summary_text || '',
      imageUrl: product.image_url || product.image_front_url || null,
      ingredients: ingredients,
      rawData: product,
    };
  }
}
