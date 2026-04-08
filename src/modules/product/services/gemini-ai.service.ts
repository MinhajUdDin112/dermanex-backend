import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

interface GeminiContent {
  parts: Array<{
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }>;
}

@Injectable()
export class GeminiAiService {
  private readonly logger = new Logger(GeminiAiService.name);
  private readonly API_KEY = process.env.GEMINI_API_KEY;
  private readonly MODEL = 'gemini-2.5-flash';
  private readonly BASE_URL =
    'https://generativelanguage.googleapis.com/v1beta/models';
  private axiosInstance: AxiosInstance;

  constructor() {
    if (!this.API_KEY) {
      this.logger.warn('GEMINI_API_KEY not set in environment variables');
    }

    this.axiosInstance = axios.create({
      baseURL: this.BASE_URL,
      timeout: 30000,
    });
  }

  async analyzeIngredients(
    ingredients: string[],
    productName: string,
  ): Promise<{
    summary: string;
    ingredientAnalysis: Array<{
      name: string;
      safetyLevel: string;
      benefits: string[];
      concerns: string[];
    }>;
    compatibilityAlerts: Array<{
      severity: string;
      message: string;
      ingredients: string[];
    }>;
    labels: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `You are a skincare expert. Analyze the following beauty/skincare product and its ingredients:

Product Name: ${productName}
Ingredients: ${ingredients.join(', ')}

Please provide a detailed analysis in the following JSON format:
{
  "summary": "Brief description of the product and its overall purpose",
  "ingredientAnalysis": [
    {
      "name": "ingredient name",
      "safetyLevel": "SAFE/CAUTION/UNSAFE",
      "benefits": ["benefit1", "benefit2"],
      "concerns": ["concern1", "concern2"]
    }
  ],
  "compatibilityAlerts": [
    {
      "severity": "warning/danger/info",
      "message": "Alert message",
      "ingredients": ["ingredient1", "ingredient2"]
    }
  ],
  "labels": ["label1", "label2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Labels should include things like: "natural", "clean-beauty", "hypoallergenic", "fragrance-free", "alcohol-free", etc.
Make sure the response is valid JSON only, no additional text.`;

      const response = await this.axiosInstance.post(
        `/${this.MODEL}:generateContent?key=${this.API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        },
      );

      const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('No response from Gemini API');
      }

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.error('Could not extract JSON from Gemini response');
        throw new Error('Invalid response format from AI');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      return analysis;
    } catch (error: any) {
      this.logger.error(
        `Error analyzing ingredients with Gemini: ${error.message}`,
      );
      throw new HttpException(
        'Failed to analyze ingredients with AI',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async analyzeWithImage(
    imageBase64: string,
    ingredients?: string[],
  ): Promise<{
    productName: string;
    brand: string;
    ingredientAnalysis: Array<{
      name: string;
      safetyLevel: string;
      benefits: string[];
      concerns: string[];
    }>;
    compatibilityAlerts: Array<{
      severity: string;
      message: string;
    }>;
    labels: string[];
    summary: string;
  }> {
    try {
      const ingredientPrompt = ingredients
        ? `Ingredients found: ${ingredients.join(', ')}\n\n`
        : '';

      const prompt = `You are a skincare expert. Analyze this product from the image:

${ingredientPrompt}
Please extract the product name, brand, and analyze all visible ingredients. Provide:

{
  "productName": "product name",
  "brand": "brand name",
  "ingredientAnalysis": [
    {
      "name": "ingredient",
      "safetyLevel": "SAFE/CAUTION/UNSAFE",
      "benefits": ["benefit1", "benefit2"],
      "concerns": ["concern1", "concern2"]
    }
  ],
  "compatibilityAlerts": [
    {
      "severity": "warning/danger/info",
      "message": "alert message"
    }
  ],
  "labels": ["label1", "label2"],
  "summary": "Brief overview of the product"
}

Return only valid JSON.`;

      const content: GeminiContent = {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      };

      const response = await this.axiosInstance.post(
        `/${this.MODEL}:generateContent?key=${this.API_KEY}`,
        {
          contents: [content],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        },
      );

      const responseContent =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseContent) {
        throw new Error('No response from Gemini Vision API');
      }

      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.error('Could not extract JSON from Gemini Vision response');
        throw new Error('Invalid response format from AI');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      return analysis;
    } catch (error: any) {
      this.logger.error(`Error analyzing image with Gemini: ${error.message}`);
      throw new HttpException(
        'Failed to analyze image with AI',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async generateCompatibilityScore(
    userIngredients: string[],
    productIngredients: string[],
  ): Promise<{ score: number; warnings: string[] }> {
    try {
      const prompt = `As a skincare expert, analyze the compatibility between the user's current products and a new product.

Current ingredients in user's routine: ${userIngredients.join(', ')}
New product ingredients: ${productIngredients.join(', ')}

Calculate a compatibility score from 0-100 (100 being perfect compatibility) and identify any potential issues.

Return JSON:
{
  "score": number,
  "warnings": ["warning1", "warning2"]
}`;

      const response = await this.axiosInstance.post(
        `/${this.MODEL}:generateContent?key=${this.API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
      );

      const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        // Return default score if API fails
        return { score: 75, warnings: [] };
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { score: 75, warnings: [] };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      this.logger.warn(
        `Error generating compatibility score: ${error.message}`,
      );
      // Return default score instead of throwing
      return { score: 75, warnings: [] };
    }
  }
}
