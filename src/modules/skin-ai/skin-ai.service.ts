import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Service } from 'src/common/services/s3.service';
import { SkinScan } from './entities/skin-scan.entity';

@Injectable()
export class SkinAiService {
  private readonly predictUrl =
    process.env.SKIN_AI_URL ?? 'http://3.139.92.30:5000/api/predict';

  constructor(
    @InjectRepository(SkinScan)
    private readonly skinScanRepository: Repository<SkinScan>,
    private readonly s3Service: S3Service,
  ) {}

  // async predict(file: Express.Multer.File, userId: string) {
  //   const formData = new FormData();
  //   const blob = new Blob([new Uint8Array(file.buffer)], {
  //     type: file.mimetype || 'application/octet-stream',
  //   });
  //   formData.append('file', blob, file.originalname || 'image');

  //   let response: Response;
  //   try {
  //     response = await fetch(this.predictUrl, {
  //       method: 'POST',
  //       body: formData,
  //     });
  //   } catch (error: any) {
  //     console.error('Error calling Skin AI service:', error);
  //     throw new BadGatewayException(
  //       `Skin AI service request failed: ${error?.message ?? 'Unknown error'}`,
  //     );
  //   }

  //   if (!response.ok) {
  //     const text = await response.text().catch(() => '');
  //     throw new BadGatewayException(
  //       `Skin AI service error (${response.status}): ${text || 'No response body'}`,
  //     );
  //   }

  //   const result = await response.json();

  //   const imageUrl = await this.s3Service.uploadFile(file, 'skin-scans');

  //   const top2 = Array.isArray(result.predictions)
  //     ? result.predictions
  //         .sort((a, b) => b.probability - a.probability)
  //         .slice(0, 2)
  //         .map((p) => ({
  //           label: p.label,
  //           percentage: Number((p.probability * 100).toFixed(2)),
  //         }))
  //     : null;

  //   const metrics = {
  //     acne: 0,
  //     wrinkles: 0,
  //     pigmentation: 0,
  //     eye_bags: 0,
  //     hydration: 0.7, // default
  //   };

  //   if (Array.isArray(result.predictions)) {
  //     for (const p of result.predictions) {
  //       if (p.label === 'acne') metrics.acne = p.probability;
  //       if (p.label === 'wrinkle') metrics.wrinkles = p.probability;
  //       if (p.label === 'puffy eyes') metrics.eye_bags = p.probability;
  //       if (p.label === 'dark skin') metrics.pigmentation = p.probability;
  //     }
  //   }

  //   // 🔹 Skin Score
  //   const skinScore = Math.round(
  //     (1 - metrics.acne) * 25 +
  //       (1 - metrics.wrinkles) * 25 +
  //       (1 - metrics.pigmentation) * 20 +
  //       (1 - metrics.eye_bags) * 15 +
  //       metrics.hydration * 15,
  //   );

  //   // 🔹 Insights
  //   const insights: string[] = [];

  //   if (metrics.acne > 0.5) {
  //     insights.push('Active acne detected. Use a gentle exfoliating cleanser.');
  //   } else {
  //     insights.push('Your skin is mostly clear and balanced.');
  //   }

  //   if (metrics.wrinkles > 0.4) {
  //     insights.push('Fine lines visible. Consider retinol-based products.');
  //   }

  //   if (metrics.pigmentation > 0.4) {
  //     insights.push('Uneven skin tone detected. Vitamin C can help.');
  //   }

  //   if (metrics.eye_bags > 0.4) {
  //     insights.push('Puffiness detected. Try caffeine-based eye cream.');
  //   }

  //   if (result.inflammation === 'low') {
  //     insights.push('Low inflammation — your skin barrier looks healthy.');
  //   }

  //   // 🔹 Routine
  //   const routine: any[] = [];

  //   routine.push({ name: 'Gentle Cleanser', status: 'completed' });

  //   if (metrics.acne > 0.4) {
  //     routine.push({
  //       name: 'Salicylic Acid Cleanser',
  //       status: 'pending',
  //     });
  //   }

  //   if (metrics.wrinkles > 0.4) {
  //     routine.push({
  //       name: 'Retinol Serum',
  //       status: 'pending',
  //     });
  //   }

  //   if (metrics.pigmentation > 0.3) {
  //     routine.push({
  //       name: 'Vitamin C Serum',
  //       status: 'pending',
  //     });
  //   }

  //   if (metrics.eye_bags > 0.3) {
  //     routine.push({
  //       name: 'Caffeine Eye Cream',
  //       status: 'pending',
  //     });
  //   }

  //   routine.push({ name: 'SPF 50 Sunscreen', status: 'pending' });

  //   const timeOfDay = this.getTimeOfDay();
  //   const scan = this.skinScanRepository.create({
  //     user: { id: userId } as any,
  //     image_url: imageUrl,
  //     model: result.model ?? null,
  //     top_label: result.top_label ?? null,
  //     confidence:
  //       typeof result.confidence === 'number' ? result.confidence : null,
  //     inflammation: result.inflammation ?? null,
  //     predictions: top2,
  //     skin_score: skinScore,
  //     metrics,
  //     insights,
  //     routine,
  //     timeOfDay: timeOfDay || 'morning',
  //   });

  //   const saved = await this.skinScanRepository.save(scan);

  //   return {
  //     id: saved.id,
  //     scannedAt: saved.scannedAt,
  //     image_url: imageUrl,
  //     model: result.model,
  //     confidence: result.confidence,
  //     inflammation: result.inflammation,
  //     predictions: top2,
  //     top_label: result.top_label,
  //     // 🔥 UI DATA
  //     skin_score: skinScore,
  //     metrics,
  //     insights,
  //     routine,
  //   };
  // }

  async predict(file: Express.Multer.File, userId: string) {
    // 🔹 Prepare file for AI API
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file.buffer)], {
      type: file.mimetype || 'application/octet-stream',
    });
    formData.append('file', blob, file.originalname || 'image');

    let response: Response;

    try {
      response = await fetch(this.predictUrl, {
        method: 'POST',
        body: formData,
      });
    } catch (error: any) {
      throw new BadGatewayException(
        `Skin AI service request failed: ${error?.message ?? 'Unknown error'}`,
      );
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new BadGatewayException(
        `Skin AI service error (${response.status}): ${text || 'No response body'}`,
      );
    }

    const result = await response.json();

    // 🔹 Upload Image
    const imageUrl = await this.s3Service.uploadFile(file, 'skin-scans');

    // 🔹 Top 2 predictions
    const top2 = Array.isArray(result.predictions)
      ? result.predictions
          .sort((a, b) => b.probability - a.probability)
          .slice(0, 2)
          .map((p) => ({
            label: p.label,
            percentage: Number((p.probability * 100).toFixed(2)),
          }))
      : null;

    // 🔹 Metrics
    const metrics = {
      acne: 0,
      wrinkles: 0,
      pigmentation: 0,
      eye_bags: 0,
      hydration: 0.7,
    };

    if (Array.isArray(result.predictions)) {
      for (const p of result.predictions) {
        if (p.label === 'acne') metrics.acne = p.probability;
        if (p.label === 'wrinkle') metrics.wrinkles = p.probability;
        if (p.label === 'puffy eyes') metrics.eye_bags = p.probability;
        if (p.label === 'dark skin') metrics.pigmentation = p.probability;
      }
    }

    // 🔹 Skin Score
    const skinScore = Math.round(
      (1 - metrics.acne) * 25 +
        (1 - metrics.wrinkles) * 25 +
        (1 - metrics.pigmentation) * 20 +
        (1 - metrics.eye_bags) * 15 +
        metrics.hydration * 15,
    );

    // 🔹 Insights
    const insights: string[] = [];

    if (metrics.acne > 0.5) {
      insights.push('Active acne detected. Use a gentle exfoliating cleanser.');
    } else {
      insights.push('Your skin is mostly clear and balanced.');
    }

    if (metrics.wrinkles > 0.4) {
      insights.push('Fine lines visible. Consider retinol-based products.');
    }

    if (metrics.pigmentation > 0.4) {
      insights.push('Uneven skin tone detected. Vitamin C can help.');
    }

    if (metrics.eye_bags > 0.4) {
      insights.push('Puffiness detected. Try caffeine-based eye cream.');
    }

    if (result.inflammation === 'low') {
      insights.push('Low inflammation — your skin barrier looks healthy.');
    }

    // 🔹 Time of Day
    const timeOfDay = this.getTimeOfDay(); // morning | evening

    // 🔥 Ritual Builder (MAIN FIX)
    const ritual: any[] = [];
    let step = 1;

    // ✅ Cleanser
    ritual.push({
      step: step++,
      title: 'Cleanser',
      product:
        metrics.acne > 0.4 ? 'Salicylic Acid Cleanser' : 'Gentle Cleanser',
      usage: '2 pumps',
      tags: ['Pure Base'],
      status: 'pending',
    });

    // ✅ Toner
    ritual.push({
      step: step++,
      title: 'Toner',
      product: 'Hydrating Toner',
      usage: '3 drops',
      tags: ['Hydration Prep'],
      status: 'pending',
    });

    // ✅ Acne Treatment
    if (metrics.acne > 0.4) {
      ritual.push({
        step: step++,
        title: 'Treatment',
        product: 'Salicylic Acid Serum',
        usage: '2 drops',
        tags: ['Acne Control'],
        status: 'pending',
      });
    }

    // ✅ Pigmentation
    if (metrics.pigmentation > 0.3) {
      ritual.push({
        step: step++,
        title: 'Serum',
        product: 'Vitamin C Serum',
        usage: '2 drops',
        tags: ['Brightening'],
        status: 'pending',
      });
    }

    // ✅ Wrinkles (ONLY EVENING)
    if (metrics.wrinkles > 0.4 && timeOfDay === 'evening') {
      ritual.push({
        step: step++,
        title: 'Night Serum',
        product: 'Retinol Serum',
        usage: '1 pea size',
        tags: ['Anti-aging'],
        status: 'pending',
      });
    }

    // ✅ Eye Bags
    if (metrics.eye_bags > 0.3) {
      ritual.push({
        step: step++,
        title: 'Eye Care',
        product: 'Caffeine Eye Cream',
        usage: 'small amount',
        tags: ['Depuff'],
        status: 'pending',
      });
    }

    // ✅ Moisturizer
    ritual.push({
      step: step++,
      title: 'Moisturizer',
      product: 'Hydrating Moisturizer',
      usage: 'pea size',
      tags: ['Barrier Repair'],
      status: 'pending',
    });

    // ✅ Sunscreen (ONLY MORNING)
    if (timeOfDay === 'morning') {
      ritual.push({
        step: step++,
        title: 'Sunscreen',
        product: 'SPF 50 Sunscreen',
        usage: '2 fingers',
        tags: ['UV Protection'],
        status: 'pending',
      });
    }

    // 🔹 Progress %
    const progress = Math.round(
      (ritual.filter((r) => r.status === 'completed').length / ritual.length) *
        100,
    );

    // 🔹 Save to DB
    const scan = this.skinScanRepository.create({
      user: { id: userId } as any,
      image_url: imageUrl,
      model: result.model ?? null,
      top_label: result.top_label ?? null,
      confidence:
        typeof result.confidence === 'number' ? result.confidence : null,
      inflammation: result.inflammation ?? null,
      predictions: top2,
      skin_score: skinScore,
      metrics,
      insights,
      ritual,
      progress,
      timeOfDay: timeOfDay || 'morning',
    });

    const saved = await this.skinScanRepository.save(scan);

    // 🔥 Final Response
    return {
      id: saved.id,
      scannedAt: saved.scannedAt,
      image_url: imageUrl,
      model: result.model,
      confidence: result.confidence,
      inflammation: result.inflammation,
      predictions: top2,
      top_label: result.top_label,

      // UI DATA
      skin_score: skinScore,
      metrics,
      insights,
      ritual,
      progress,
      timeOfDay,
    };
  }

  private getTimeOfDay(): 'morning' | 'evening' {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 17) {
      return 'morning';
    }

    return 'evening';
  }

  async getLatestPrediction(userId: string) {
    const latest = await this.skinScanRepository.findOne({
      where: { user: { id: userId } },
      order: { scannedAt: 'DESC' },
    });

    if (!latest) {
      return null;
    }

    return {
      id: latest.id,
      scannedAt: latest.scannedAt,
      image_url: latest.image_url,
      model: latest.model,
      confidence: latest.confidence,
      inflammation: latest.inflammation,
      predictions: latest.predictions,
      top_label: latest.top_label,
    };
  }

  async getLatestByTimeOfDay(userId: string) {
    const [morning, evening] = await Promise.all([
      this.skinScanRepository.findOne({
        where: { user: { id: userId }, timeOfDay: 'morning' },
        order: { scannedAt: 'DESC' },
      }),
      this.skinScanRepository.findOne({
        where: { user: { id: userId }, timeOfDay: 'evening' },
        order: { scannedAt: 'DESC' },
      }),
    ]);

    return {
      morning: this.mapTimeOfDayScan(morning),
      evening: this.mapTimeOfDayScan(evening),
    };
  }

  private mapTimeOfDayScan(scan: SkinScan | null) {
    if (!scan) {
      return null;
    }

    return {
      id: scan.id,
      scannedAt: scan.scannedAt,
      image_url: scan.image_url,
      timeOfDay: scan.timeOfDay,
      skin_score: scan.skin_score ?? null,
      metrics: scan.metrics ?? null,
      insights: scan.insights ?? null,
      ritual: scan.ritual ?? null,
      progress: scan.progress ?? null,
    };
  }

  async completeRitualStep(
    userId: string,
    timeOfDay: 'morning' | 'evening',
    stepNumber: number,
  ) {
    const scan = await this.skinScanRepository.findOne({
      where: {
        user: { id: userId },
        timeOfDay: timeOfDay,
      },
      order: { createdAt: 'DESC' },
    });

    if (!scan) {
      throw new NotFoundException(`${timeOfDay} ritual not found`);
    }

    // ✅ enforce step order
    const currentStep = scan.ritual.find((s) => s.status === 'pending');

    if (currentStep && currentStep.step !== stepNumber) {
      throw new BadRequestException(`Complete step ${currentStep.step} first`);
    }

    // ✅ update step
    scan.ritual = scan.ritual.map((step) => {
      if (step.step === stepNumber) {
        return { ...step, status: 'completed' };
      }
      return step;
    });

    // ✅ progress calculation
    const totalSteps = scan.ritual.length;
    const completedSteps = scan.ritual.filter(
      (s) => s.status === 'completed',
    ).length;

    scan.progress = Math.round((completedSteps / totalSteps) * 100);

    await this.skinScanRepository.save(scan);

    return {
      msg: `${timeOfDay} step completed`,
      statusCode: 200,
      data: {
        ritual: scan.ritual,
        progress: scan.progress,
        currentStep:
          scan.ritual.find((s) => s.status === 'pending')?.step || null,
      },
    };
  }
}
