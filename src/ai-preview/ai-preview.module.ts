import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiPreviewController } from './ai-preview.controller';
import { AiPreviewService } from './ai-preview.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from '../auth/entities/auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavedDesign, AiDesign, Auth])],
  controllers: [AiPreviewController],
  providers: [AiPreviewService, GeminiService, PlacementService],
})
export class AiPreviewModule {}
