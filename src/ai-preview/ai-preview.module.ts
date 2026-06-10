import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiPreviewController } from './ai-preview.controller';
import { AiPreviewService } from './ai-preview.service';
import { GeminiService } from './gemini.service';
import { PlacementService } from './placement.service';
import { SavedDesign } from './entities/saved-design.entity';
import { AiDesign } from './entities/ai-design.entity';
import { Auth } from '../auth/entities/auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavedDesign, AiDesign, Auth])],
  controllers: [AiPreviewController],
  providers: [AiPreviewService, GeminiService, PlacementService],
})
export class AiPreviewModule {}
