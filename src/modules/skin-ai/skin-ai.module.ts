import { Module } from '@nestjs/common';
import { SkinAiController } from './skin-ai.controller';
import { SkinAiService } from './skin-ai.service';

@Module({
  controllers: [SkinAiController],
  providers: [SkinAiService]
})
export class SkinAiModule {}
