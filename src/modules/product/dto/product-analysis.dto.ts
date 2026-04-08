export class IngredientAnalysisDto {
  name!: string;
  safetyLevel!: string; // SAFE, CAUTION, UNSAFE, UNKNOWN
  benefits!: string[];
  concerns!: string[];
  avoidWith?: string[];
}

export class CompatibilityAlertDto {
  severity!: string;
  message!: string;
  ingredient!: string;
}

export class ProductAnalysisResponseDto {
  productId!: string;
  productName!: string;
  brand?: string;
  productCategory?: string;
  barcode!: string;
  imageUrl?: string;

  compatibilityScore!: number; // 0-100
  compatibilityAlerts!: CompatibilityAlertDto[];
  ingredientAnalysis!: IngredientAnalysisDto[];
  labels!: string[]; // e.g., ['clean-beauty', 'natural', 'hypoallergenic']

  aiInsights?: {
    summary?: string;
    recommendations?: string[];
    ritualCompatibility?: string;
  };
}

export class ScanResultDto {
  success!: boolean;
  data?: ProductAnalysisResponseDto;
  error?: string;
}
