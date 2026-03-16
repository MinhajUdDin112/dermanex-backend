import { BadGatewayException, Injectable } from '@nestjs/common';
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

  async predict(file: Express.Multer.File, userId: string) {
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
      console.error('Error calling Skin AI service:', error);
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

    const imageUrl = await this.s3Service.uploadFile(file, 'skin-scans');

    const top2 = Array.isArray(result.predictions)
      ? result.predictions
          .sort((a, b) => b.probability - a.probability)
          .slice(0, 2)
          .map((p) => ({
            label: p.label,
            percentage: Number((p.probability * 100).toFixed(2)),
          }))
      : null;

    const scan = this.skinScanRepository.create({
      user: { id: userId } as any,
      image_url: imageUrl,
      model: result.model ?? null,
      top_label: result.top_label ?? null,
      confidence:
        typeof result.confidence === 'number' ? result.confidence : null,
      inflammation: result.inflammation ?? null,
      predictions: top2,
    });

    const saved = await this.skinScanRepository.save(scan);

    return {
      id: saved.id,
      scannedAt: saved.scannedAt,
      image_url: imageUrl,
      model: result.model,
      confidence: result.confidence,
      inflammation: result.inflammation,
      predictions: top2,
      top_label: result.top_label,
    };
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
}
