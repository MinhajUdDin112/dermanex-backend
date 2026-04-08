# Barcode Scanning & Product Analysis - Quick Start Guide

## Overview

Your NestJS backend now has a complete barcode scanning and ingredient analysis system powered by:

- **Open Beauty Facts API** - Product and ingredient data
- **Google Gemini AI** - Intelligent analysis and compatibility checks

## 🚀 Getting Started

### 1. Environment Setup

Your `.env` file already has the Gemini API key configured:

```env
GEMINI_API_KEY=AIzaSyAJR28eTMa22IgSlhrBNmaqe3NP81TcuC8
```

### 2. Database Configuration

The system automatically creates all necessary tables through TypeORM:

- `products` - Stores product data
- `ingredients` - Ingredient database
- `product_analyses` - Analysis results
- `product_ingredients` - Many-to-many relationship

No manual migration needed if `synchronize: true` in your database config.

### 3. Start the Server

```bash
npm run start:dev
```

## 📡 API Endpoints

### Scan a Barcode

```bash
curl -X POST http://localhost:3000/products/scan \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "barcode": "5054614916012"
  }'
```

**Example Response:**

```json
{
  "productId": "a1b2c3d4-e5f6-g7h8...",
  "productName": "Niacinamide 10% + Zinc 1%",
  "brand": "The Ordinary",
  "productCategory": "Serums",
  "barcode": "5054614916012",
  "imageUrl": "https://...",
  "compatibilityScore": 75,
  "compatibilityAlerts": [
    {
      "severity": "warning",
      "message": "May interact with BHAs when used together",
      "ingredient": "Niacinamide"
    }
  ],
  "ingredientAnalysis": [
    {
      "name": "Niacinamide",
      "safetyLevel": "SAFE",
      "benefits": [
        "Reduces redness",
        "Oil control",
        "Strengthens skin barrier"
      ],
      "concerns": ["May cause irritation in sensitive skin"],
      "avoidWith": ["High pH products"]
    },
    {
      "name": "Zinc PCA",
      "safetyLevel": "SAFE",
      "benefits": ["Oil control", "Antimicrobial"],
      "concerns": []
    }
  ],
  "labels": ["cruelty-free", "vegan"],
  "aiInsights": {
    "summary": "A powerhouse serum combination featuring niacinamide and zinc...",
    "recommendations": [
      "Use once daily in AM or PM routine",
      "Follow with moisturizer to prevent irritation",
      "Introduce gradually if new to niacinamide"
    ],
    "ritualCompatibility": "Works well with moisturizers and SPF"
  }
}
```

### Analyze from Product Image

```bash
curl -X POST http://localhost:3000/products/analyze-image \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "barcode": "optional-barcode"
  }'
```

### Get Stored Analysis

```bash
curl -X GET http://localhost:3000/products/{productId} \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

## 🎯 System Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SCAN BARCODE                                             │
│    POST /products/scan { barcode: "123..." }                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CHECK DATABASE                                           │
│    Look for existing product                                │
└──────────────┬────────────────────────────────┬─────────────┘
               │                                │
         FOUND │                                │ NOT FOUND
               │                                │
               ▼                                ▼
        ┌──────────────┐          ┌──────────────────────────┐
        │ Return cache │          │ 3. FETCH FROM API        │
        │ (Fast!)      │          │ Open Beauty Facts        │
        └──────────────┘          └──────────┬───────────────┘
               │                             │
               │                             ▼
               │                   ┌──────────────────────────┐
               │                   │ 4. EXTRACT INGREDIENTS   │
               │                   │ Parse ingredient list    │
               │                   └──────────┬───────────────┘
               │                             │
               │                             ▼
               │                   ┌──────────────────────────┐
               │                   │ 5. CALL GEMINI AI        │
               │                   │ Analyze ingredients      │
               │                   └──────────┬───────────────┘
               │                             │
               │                             ▼
               │                   ┌──────────────────────────┐
               │                   │ 6. STORE IN DATABASE     │
               │                   │ Save product & analysis  │
               │                   └──────────┬───────────────┘
               │                             │
               └─────────────────┬───────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ 7. RETURN TO CLIENT      │
                    │ Score, alerts, insights  │
                    └──────────────────────────┘
```

## 📊 Data Structure

### Product Object

- `id` (UUID): Unique identifier
- `barcode` (String): Product barcode
- `productName` (String): Product name
- `brand` (String): Brand name
- `productCategory` (String): Type (Serum, Moisturizer, etc.)
- `description` (Text): Product description
- `imageUrl` (String): Product image URL
- `ingredients` (Array): Related ingredients
- `analyses` (Array): AI analysis results

### Ingredient Object

- `id` (UUID): Unique identifier
- `name` (String): Ingredient name
- `inci` (String): INCI nomenclature
- `safetyLevel` (Enum): SAFE, CAUTION, UNSAFE, UNKNOWN
- `benefits` (Text): comma-separated benefits
- `concerns` (Text): comma-separated concerns
- `compatibilityInfo` (JSON): pH, conflicts, synergies

### Analysis Object

- `id` (UUID): Unique identifier
- `compatibilityScore` (1-100): Overall compatibility score
- `compatibilityAlerts` (Array): Warnings and alerts
- `ingredientAnalysis` (Array): Per-ingredient breakdown
- `labels` (Array): Product classifications
- `aiInsights` (Object): AI-generated recommendations

## 🔍 Tested Barcodes

You can test with these real products:

- `5054614916012` - The Ordinary Niacinamide 10% + Zinc 1%
- `5054614924435` - The Ordinary Hyaluronic Acid 2% + B5
- `0887167020768` - Cetaphil Gentle Skin Cleanser

## 🛠 Troubleshooting

### API Returns 404

```json
{ "error": "Product not found" }
```

**Solution:** Product not found in Open Beauty Facts. Try another barcode.

### API Returns 503

```json
{ "error": "Failed to analyze ingredients with AI" }
```

**Solution:** Gemini API issue. Check that `GEMINI_API_KEY` is valid in `.env`.

### JWT Token Error

```json
{ "error": "Unauthorized" }
```

**Solution:** Include a valid JWT token in Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 📚 File Structure

```
src/modules/product/
├── product.controller.ts        # API endpoints
├── product.module.ts            # Module definition
├── README.md                     # Detailed documentation
├── dto/
│   ├── index.ts
│   ├── scan-barcode.dto.ts      # Request DTOs
│   └── product-analysis.dto.ts  # Response DTOs
├── entities/
│   ├── product.entity.ts        # Product model
│   ├── ingredient.entity.ts     # Ingredient model
│   └── product-analysis.entity.ts # Analysis model
└── services/
    ├── product.service.ts       # Main orchestrator
    ├── gemini-ai.service.ts     # AI analysis
    └── open-beauty-facts.service.ts # Data fetching
```

## 🚀 Next Steps

1. **Test the endpoints** with provided test barcodes
2. **Integrate with frontend** - Send JWT token in Authorization header
3. **Monitor performance** - Database caching improves repeat lookups
4. **Expand labels** - Add more product classification labels as needed
5. **Add user preferences** - Link analysis to user skincare routines

## 📞 Support Resources

- **Open Beauty Facts API**: https://world.openbeautyfacts.org/api/v3/
- **Google Gemini API**: https://ai.google.dev/docs
- **NestJS Documentation**: https://docs.nestjs.com
- **TypeORM Documentation**: https://typeorm.io

## 🎨 Customization

### Change AI Model

Edit `src/modules/product/services/gemini-ai.service.ts`:

```typescript
private readonly MODEL = 'gemini-2.0-flash'; // Change to gemini-pro, etc.
```

### Add Custom Labels

Extend the Gemini prompt in:

```typescript
const prompt = `... Labels should include ...`;
```

### Modify Scoring Algorithm

Update `product.service.ts`:

```typescript
const compatibilityScore = calculateScore(analysis);
```

---

**Build Status:** ✅ Successfully compiled
**Database:** ✅ Auto-synchronized
**APIs:** ✅ Connected (Open Beauty Facts + Gemini)
**Ready to Deploy!** 🚀
