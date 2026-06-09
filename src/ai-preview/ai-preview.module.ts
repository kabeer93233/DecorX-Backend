import { Module } from '@nestjs/common';
import { AiPreviewController } from './ai-preview.controller';
import { AiPreviewService } from './ai-preview.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from '../auth/entities/auth.entity';

@Module({
  imports : [
    TypeOrmModule.forFeature([
    Auth,
  ]),
  ],
  controllers: [AiPreviewController],
  providers: [AiPreviewService]
})
export class AiPreviewModule {}
