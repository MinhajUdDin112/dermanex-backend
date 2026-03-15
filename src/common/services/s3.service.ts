import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>("S3_REGION");
    const accessKeyId = this.configService.get<string>("S3_ACCESS_KEY_ID");
    const secretAccessKey = this.configService.get<string>(
      "S3_SECRET_ACCESS_KEY"
    );

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error("AWS credentials are not properly configured");
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const bucketName = this.configService.get<string>("S3_BUCKET_NAME");
    if (!bucketName) {
      throw new Error("AWS S3 bucket name is not configured");
    }
    const key = `${folder}/${Date.now()}-${file.originalname}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      // Return the S3 URL
      return `https://${bucketName}.s3.amazonaws.com/${key}`;
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const bucketName = this.configService.get<string>("S3_BUCKET_NAME");
    if (!bucketName) {
      throw new Error("AWS S3 bucket name is not configured");
    }
    const key = fileUrl.split(`${bucketName}.s3.amazonaws.com/`)[1];

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        })
      );
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${error.message}`);
      throw error;
    }
  }
}
