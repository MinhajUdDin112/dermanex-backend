import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromAddress: string | null = null;
  private readonly isConfigured: boolean = false;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    const from = this.configService.get<string>('SENDGRID_FROM');

    if (apiKey && from) {
      sgMail.setApiKey(apiKey);
      this.fromAddress = from;
      this.isConfigured = true;
    } else {
      this.logger.warn(
        'Email service is not configured. Missing SENDGRID_API_KEY or SENDGRID_FROM environment variables.',
      );
    }
  }

  async sendMail(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    if (!this.isConfigured || !this.fromAddress) {
      throw new InternalServerErrorException('Email service not configured');
    }

    try {
      await sgMail.send({
        from: this.fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email: ${message}`);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
