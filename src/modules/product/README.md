# Product Barcode Scanning & Ingredient Analysis API

This module implements a comprehensive product analysis system that scans barcodes, fetches ingredient data, and provides AI-powered analysis with compatibility alerts.

## Features

- **Barcode Scanning**: Scan product barcodes and extract ingredient information
- **Open Beauty Facts Integration**: Automatically fetch product data from Open Beauty Facts API
- **Gemini AI Analysis**: Intelligent ingredient analysis using Google's Gemini API
- **Image Analysis**: Extract product info and ingredients from product images
- **Compatibility Alerts**: AI-powered alerts for ingredient interactions
- **Database Caching**: Store analyzed products to avoid duplicate API calls
- **Safety Scoring**: Compatibility score system (0-100)

## Architecture

### Flow Diagram

```
Scan Barcode
    ↓
Check DB for existing product
    ↓
If missing → Call Open Beauty Facts API
    ↓
Extract ingredients
    ↓
Call Gemini AI for analysis
    ↓
Store product, ingredients, and analysis in DB
    ↓
Return formatted response with:
  - Compatibility score
  - Compatibility alerts
  - Ingredient analysis
  - AI insights
  - Labels
```

## Entities

### Product

- **barcode**: Unique product barcode
- **productName**: Name of the product
- **brand**: Brand name
- **productCategory**: Category/type
- **ingredients**: Many-to-many relationship with Ingredient
- **analyses**: One-to-many relationship with ProductAnalysis

### Ingredient

- **name**: Ingredient name
- **inci**: INCI name (International Nomenclature)
- **safetyLevel**: SAFE, CAUTION, UNSAFE, or UNKNOWN
- **benefits**: Array of benefits
- **concerns**: Array of concerns
- **compatibilityInfo**: pH, avoid with, benefits from

### ProductAnalysis

- **product**: Reference to Product
- **compatibilityScore**: 0-100 score
- **compatibilityAlerts**: Array of alerts
- **ingredientAnalysis**: Detailed ingredient breakdown
- **labels**: Product labels (clean-beauty, vegan, etc.)
- **aiInsights**: AI-generated summary and recommendations

## API Endpoints

### 1. Scan Barcode

```http
POST /products/scan
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "barcode": "123456789"
}
```

**Response:**

```json
{
  "productId": "uuid",
  "productName": "Niacinamide 10% + Zinc 1%",
  "brand": "The Ordinary",
  "productCategory": "Serums",
  "barcode": "123456789",
  "imageUrl": "https://...",
  "compatibilityScore": 45,
  "compatibilityAlerts": [
    {
      "severity": "warning",
      "message": "Mixing this with your current AHA toner may cause irritation",
      "ingredient": "Niacinamide"
    }
  ],
  "ingredientAnalysis": [
    {
      "name": "Niacinamide",
      "safetyLevel": "SAFE",
      "benefits": ["Reduces redness", "Minimizes pores", "Oil control"],
      "concerns": ["May cause irritation in sensitive skin"],
      "avoidWith": ["High pH products"]
    },
    {
      "name": "Zinc PCA",
      "safetyLevel": "SAFE",
      "benefits": ["Oil control", "Soothing"],
      "concerns": []
    }
  ],
  "labels": ["cruelty-free", "vegan", "clean-beauty"],
  "aiInsights": {
    "summary": "A powerhouse serum combining niacinamide and zinc...",
    "recommendations": ["Use once daily", "Follow with moisturizer"],
    "ritualCompatibility": "Compatible with morning routine"
  }
}
```

### 2. Analyze Product Image

```http
POST /products/analyze-image
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "barcode": "optional-barcode"
}
```

**Response:** Same as barcode scan response

### 3. Get Product Analysis

```http
GET /products/:productId
Authorization: Bearer <jwt_token>
```

## Environment Variables

Add to your `.env` file:

```env
# Gemini API Configuration
GEMINI_API_KEY=AIzaSyAJR28eTMa22IgSlhrBNmaqe3NP81TcuC8

# Database Configuration (existing)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=dermanex_db
DB_SSL=false
```

## Database Setup

The module uses TypeORM to automatically create tables. Ensure your database connection is configured in `database.config.ts`.

If `synchronize: true` is set in development, tables will be created automatically.

To manually run migrations:

```bash
npm run typeorm migration:run
```

## Services

### ProductService

Main orchestrator service that:

- Checks database for existing products
- Calls Open Beauty Facts API if needed
- Calls Gemini AI for ingredient analysis
- Stores results in database
- Formats responses

### OpenBeautyFactsService

- Fetches product data by barcode
- Parses ingredient information
- Handles API errors gracefully

### GeminiAiService

- Analyzes ingredients for safety and benefits
- Determines compatibility alerts
- Extracts information from product images
- Generates compatibility scores

## Usage Examples

### Frontend: Scan Barcode

```javascript
const response = await fetch('/products/scan', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    barcode: '5054614916012', // Niacinamide 10% + Zinc 1%
  }),
});

const analysis = await response.json();
console.log('Compatibility Score:', analysis.compatibilityScore);
console.log('Alerts:', analysis.compatibilityAlerts);
```

### Frontend: Analyze Product Image

```javascript
async function analyzeProductImage(imageFile) {
  const reader = new FileReader();

  reader.onload = async (e) => {
    const base64 = e.target.result.split(',')[1];

    const response = await fetch('/products/analyze-image', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: base64,
      }),
    });

    const analysis = await response.json();
    displayProductAnalysis(analysis);
  };

  reader.readAsDataURL(imageFile);
}
```

## AI Prompt Strategy

The Gemini AI uses specialized prompts for:

1. **Ingredient Analysis**: Evaluates safety, benefits, concerns, and compatibility
2. **Image Analysis**: Extracts product information and ingredients from photos
3. **Compatibility Scoring**: Evaluates ingredient interactions with user's current routine

## Error Handling

- Product not found in external API: Returns 404
- AI service unavailable: Returns 503 with fallback data
- Invalid barcode format: Returns 400
- Unauthorized access: Returns 401

## Testing

```bash
# Create a test product scan
curl -X POST http://localhost:3000/products/scan \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"barcode":"5054614916012"}'
```

## Performance Optimization

- Database caches analyzed products to avoid repeated API calls
- Ingredient data is reused across products
- AI analyses are stored for future reference
- Consider adding Redis caching for frequently scanned products

## Future Enhancements

- [ ] Barcode image processing (scan from camera)
- [ ] User skincare routine tracking
- [ ] Personalized compatibility based on skin type
- [ ] Product recommendations
- [ ] Ingredient database expansion
- [ ] Multi-language support
- [ ] Batch product analysis

## Dependencies

- `axios`: HTTP client for API calls
- `@nestjs/typeorm`: ORM integration
- `typeorm`: Database ORM
- `pg`: PostgreSQL driver
- `class-validator`: DTO validation
