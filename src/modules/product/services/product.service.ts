import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Ingredient } from '../entities/ingredient.entity';
import { ProductAnalysis } from '../entities/product-analysis.entity';
import { OpenBeautyFactsService } from './open-beauty-facts.service';
import { GeminiAiService } from './gemini-ai.service';
import { ProductAnalysisResponseDto } from '../dto/product-analysis.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(ProductAnalysis)
    private analysisRepository: Repository<ProductAnalysis>,
    private openBeautyFactsService: OpenBeautyFactsService,
    private geminiAiService: GeminiAiService,
  ) {}

  async scanBarcode(
    barcode: string,
    userId?: string,
  ): Promise<ProductAnalysisResponseDto> {
    try {
      this.logger.debug(`Scanning barcode: ${barcode}`);

      // Step 1: Check if product already exists in DB
      let product = await this.productRepository.findOne({
        where: { barcode },
        relations: ['ingredients', 'analyses'],
      });

      // Step 2: If not found, fetch from Open Beauty Facts
      if (!product) {
        this.logger.debug(`Product not in DB, fetching from Open Beauty Facts`);
        const openBeautyData =
          await this.openBeautyFactsService.getProductByBarcode(barcode);

        if (!openBeautyData) {
          throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
        }

        // Create new product
        const newProduct = new Product();
        newProduct.barcode = openBeautyData.barcode;
        newProduct.productName = openBeautyData.productName;
        newProduct.brand = openBeautyData.brand;
        newProduct.productCategory = openBeautyData.productCategory;
        newProduct.description = openBeautyData.description;
        newProduct.imageUrl = openBeautyData.imageUrl;
        newProduct.rawData = openBeautyData.rawData;

        // Save product
        product = await this.productRepository.save(newProduct);
      }

      // Step 3: Process ingredients and get/create analysis
      let analysis = product.analyses?.[0] || null;

      if (!analysis) {
        this.logger.debug(`Creating new analysis for product: ${product.id}`);
        analysis = await this.analyzeProduct(product, userId);
      }

      return this.formatAnalysisResponse(product, analysis);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error scanning barcode: ${errorMessage}`);
      throw error;
    }
  }

  private async analyzeProduct(
    product: Product,
    userId?: string,
  ): Promise<ProductAnalysis> {
    try {
      // Ensure product has ingredients loaded
      if (!product.ingredients || product.ingredients.length === 0) {
        product.ingredients = await this.getOrCreateIngredients(product);
      }

      const ingredientNames = product.ingredients.map((ing) => ing.name);

      // Get AI analysis
      const aiAnalysis = await this.geminiAiService.analyzeIngredients(
        ingredientNames,
        product.productName,
      );

      // Create or update ingredients with AI data
      const analysisIngredients = aiAnalysis.ingredientAnalysis || [];
      for (const ingData of analysisIngredients) {
        let ingredient = await this.ingredientRepository.findOne({
          where: { name: ingData.name },
        });

        if (!ingredient) {
          ingredient = new Ingredient();
          ingredient.name = ingData.name;
          ingredient.safetyLevel = (ingData.safetyLevel as any) || 'UNKNOWN';
          ingredient.benefits = ingData.benefits?.join(',') || '';
          ingredient.concerns = ingData.concerns?.join(',') || '';
          ingredient = await this.ingredientRepository.save(ingredient);
        }

        // Add to product if not already there
        if (!product.ingredients.find((i) => i.id === ingredient.id)) {
          product.ingredients.push(ingredient);
        }
      }

      // Save updated product
      product = await this.productRepository.save(product);

      // Calculate compatibility score
      const compatibilityScore = 75; // Default score

      // Create analysis record
      const analysis = new ProductAnalysis();
      analysis.product = product;
      analysis.productId = product.id;
      analysis.userId = userId ? userId : null;
      analysis.compatibilityScore = compatibilityScore;
      analysis.compatibilityAlerts = this.formatCompatibilityAlerts(aiAnalysis);
      analysis.ingredientAnalysis = analysisIngredients;
      analysis.labels = aiAnalysis.labels || [];
      analysis.aiInsights = {
        summary: aiAnalysis.summary,
        recommendations: aiAnalysis.recommendations || [],
      };
      analysis.rawAiResponse = JSON.stringify(aiAnalysis);

      return await this.analysisRepository.save(analysis);
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error analyzing product: ${errorMessage}`);
      throw error;
    }
  }

  private async getOrCreateIngredients(
    product: Product,
  ): Promise<Ingredient[]> {
    const ingredients: Ingredient[] = [];

    if (product.rawData?.ingredients_text) {
      const ingredientTexts = product.rawData.ingredients_text
        .split(/[,;]/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      for (const ingText of ingredientTexts) {
        let ingredient = await this.ingredientRepository.findOne({
          where: { name: ingText },
        });

        if (!ingredient) {
          const newIngredient = new Ingredient();
          newIngredient.name = ingText;
          newIngredient.safetyLevel = 'UNKNOWN';
          ingredient = await this.ingredientRepository.save(newIngredient);
        }

        ingredients.push(ingredient);
      }
    }

    return ingredients;
  }

  private formatCompatibilityAlerts(
    aiAnalysis: any,
  ): Array<{ severity: string; message: string; ingredient: string }> {
    const alerts: Array<{
      severity: string;
      message: string;
      ingredient: string;
    }> = [];

    if (aiAnalysis.compatibilityAlerts) {
      for (const alert of aiAnalysis.compatibilityAlerts) {
        for (const ingredient of alert.ingredients || ['Unknown']) {
          alerts.push({
            severity: alert.severity || 'info',
            message: alert.message,
            ingredient,
          });
        }
      }
    }

    return alerts;
  }

  private formatAnalysisResponse(
    product: Product,
    analysis: ProductAnalysis,
  ): ProductAnalysisResponseDto {
    return {
      productId: product.id,
      productName: product.productName,
      brand: product.brand || 'Unknown Brand',
      productCategory: product.productCategory || 'Beauty Product',
      barcode: product.barcode,
      imageUrl: product.imageUrl || undefined,
      compatibilityScore: analysis.compatibilityScore,
      compatibilityAlerts: analysis.compatibilityAlerts,
      ingredientAnalysis: analysis.ingredientAnalysis,
      labels: analysis.labels,
      aiInsights: analysis.aiInsights || {},
    };
  }

  async analyzeWithImage(
    imageBase64: string,
    barcode?: string,
    userId?: string,
  ): Promise<ProductAnalysisResponseDto> {
    try {
      this.logger.debug(`Analyzing product image`);

      // Get AI analysis from image
      const imageAnalysis =
        await this.geminiAiService.analyzeWithImage(imageBase64);

      let product = await this.productRepository.findOne({
        where: { barcode },
        relations: ['ingredients'],
      });

      if (!product) {
        // Create new product from image analysis
        const newProduct = new Product();
        newProduct.barcode = barcode || `IMG_${Date.now()}`;
        newProduct.productName = imageAnalysis.productName;
        newProduct.brand = imageAnalysis.brand;
        newProduct.productCategory = 'Beauty/Skincare';
        newProduct.imageUrl = `data:image/jpeg;base64,${imageBase64.substring(0, 100)}...`; // Store reference

        product = await this.productRepository.save(newProduct);
      }

      // Ensure ingredients exist
      if (!product.ingredients || product.ingredients.length === 0) {
        const ingredientNames = imageAnalysis.ingredientAnalysis.map(
          (ing) => ing.name,
        );
        product.ingredients = [];

        for (const ingName of ingredientNames) {
          let ingredient = await this.ingredientRepository.findOne({
            where: { name: ingName },
          });

          if (!ingredient) {
            const newIngredient = new Ingredient();
            newIngredient.name = ingName;
            newIngredient.safetyLevel = 'UNKNOWN';
            ingredient = await this.ingredientRepository.save(newIngredient);
          }

          product.ingredients.push(ingredient);
        }

        product = await this.productRepository.save(product);
      }

      // Create analysis
      const analysis = new ProductAnalysis();
      analysis.product = product;
      analysis.productId = product.id;
      analysis.userId = userId ? userId : null;
      analysis.compatibilityScore = 75;
      analysis.compatibilityAlerts = imageAnalysis.compatibilityAlerts.map(
        (alert) => ({
          severity: alert.severity,
          message: alert.message,
          ingredient: 'Multiple',
        }),
      );
      analysis.ingredientAnalysis = imageAnalysis.ingredientAnalysis;
      analysis.labels = imageAnalysis.labels;
      analysis.aiInsights = {
        summary: imageAnalysis.summary,
      };

      await this.analysisRepository.save(analysis);

      return this.formatAnalysisResponse(product, analysis);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error analyzing image: ${errorMessage}`);
      throw error;
    }
  }

  async getProductAnalysis(
    productId: string,
  ): Promise<ProductAnalysisResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['ingredients', 'analyses'],
    });

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    const analysis = product.analyses?.[0];
    if (!analysis) {
      throw new HttpException('Analysis not found', HttpStatus.NOT_FOUND);
    }

    return this.formatAnalysisResponse(product, analysis);
  }
}
