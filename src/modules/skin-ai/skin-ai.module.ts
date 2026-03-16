import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkinAiController } from './skin-ai.controller';
import { SkinAiService } from './skin-ai.service';
import { SkinScan } from './entities/skin-scan.entity';
import { S3Service } from 'src/common/services/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([SkinScan])],
  controllers: [SkinAiController],
  providers: [SkinAiService, S3Service],
})
export class SkinAiModule {}
