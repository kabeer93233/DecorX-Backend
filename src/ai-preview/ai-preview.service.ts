import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiDesign } from './entities/ai-design.entity';
import { GeminiService } from './gemini.service';
import { AnalyzeRoomDto } from './dto/analyze-room.dto';

@Injectable()
export class AiPreviewService {
  private readonly logger = new Logger(AiPreviewService.name);

  constructor(
    @InjectRepository(AiDesign)
    private readonly aiDesignRepo: Repository<AiDesign>,
    private readonly gemini: GeminiService,
  ) {}

  async analyzeRoom(dto: AnalyzeRoomDto) {
    const analysis = await this.gemini.analyzeRoom(dto.roomImageUrl);
    return { success: true, data: analysis };
  }

  async getMyAiDesigns(userId: number) {
    const designs = await this.aiDesignRepo.find({
      where: { userId, isDeleted: false },
      order: { createdAt: 'DESC' },
      select: ['id', 'productId', 'productName', 'roomImageUrl', 'resultImageUrl', 'roomType', 'roomStyle', 'createdAt'],
    });
    return { success: true, data: designs };
  }

  async deleteAiDesign(id: string, userId: number) {
    const design = await this.aiDesignRepo.findOne({ where: { id } });
    if (!design) throw new NotFoundException();
    if (design.userId !== userId) throw new ForbiddenException();
    await this.aiDesignRepo.update(id, { isDeleted: true });
    return { success: true };
  }
}
