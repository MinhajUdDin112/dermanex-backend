import { BadGatewayException, Injectable } from '@nestjs/common';

@Injectable()
export class SkinAiService {
  private readonly predictUrl =
    process.env.SKIN_AI_URL ?? 'http://3.139.92.30:5000/api/predict';

  async predict(file: Express.Multer.File) {
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

    const top2 = result.predictions
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 2)
      .map((p) => ({
        label: p.label,
        percentage: (p.probability * 100).toFixed(2) + '%',
      }));

    return {
      model: result.model,
      results: top2,
    };
  }
}
