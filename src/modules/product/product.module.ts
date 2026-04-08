import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './services/product.service';
import { OpenBeautyFactsService } from './services/open-beauty-facts.service';
import { GeminiAiService } from './services/gemini-ai.service';
import { Product } from './entities/product.entity';
import { Ingredient } from './entities/ingredient.entity';
import { ProductAnalysis } from './entities/product-analysis.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Ingredient, ProductAnalysis])],
  controllers: [ProductController],
  providers: [ProductService, OpenBeautyFactsService, GeminiAiService],
  exports: [ProductService],
})
export class ProductModule {}
