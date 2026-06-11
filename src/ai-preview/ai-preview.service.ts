import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import FormData from 'form-data';
import { AiDesign } from './entities/ai-design.entity';
import { GeminiService } from './gemini.service';
import { AnalyzeRoomDto } from './dto/analyze-room.dto';
import { SuggestPlacement2dDto } from './dto/suggest-placement-2d.dto';
import { SaveAiDesignDto } from './dto/save-ai-design.dto';

// Scale values are tuned for a 900×600 canvas with typical Unsplash product images (~800–1080px wide).
// xPct/yPct are fractions of canvas dimensions. Multiple positions cycle via existingCount.
const PLACEMENT_RULES: Record<string, Array<{ xPct: number; yPct: number; scale: number; reason: string }>> = {
  sofa: [
    { xPct: 0.22, yPct: 0.68, scale: 0.30, reason: 'Sofa placed along the main wall — classic living room focal point.' },
    { xPct: 0.60, yPct: 0.68, scale: 0.28, reason: 'Second sofa forming an L-shaped seating arrangement.' },
    { xPct: 0.38, yPct: 0.72, scale: 0.30, reason: 'Sofa centred for open-plan layouts.' },
  ],
  loveseat: [
    { xPct: 0.25, yPct: 0.66, scale: 0.24, reason: 'Loveseat beside the main wall to complement the seating area.' },
    { xPct: 0.62, yPct: 0.64, scale: 0.22, reason: 'Loveseat angled for a cozy conversation corner.' },
  ],
  chair: [
    { xPct: 0.72, yPct: 0.66, scale: 0.18, reason: 'Accent chair to the right — complements the main sofa.' },
    { xPct: 0.12, yPct: 0.64, scale: 0.17, reason: 'Reading chair in the left corner for balance.' },
    { xPct: 0.82, yPct: 0.68, scale: 0.18, reason: 'Accent chair in the far corner.' },
    { xPct: 0.50, yPct: 0.63, scale: 0.16, reason: 'Chair placed centrally as a conversation piece.' },
  ],
  table: [
    { xPct: 0.38, yPct: 0.66, scale: 0.24, reason: 'Coffee table centred between seating areas.' },
    { xPct: 0.20, yPct: 0.62, scale: 0.18, reason: 'Side table beside the sofa for convenience.' },
    { xPct: 0.72, yPct: 0.62, scale: 0.18, reason: 'Side table on the right of the seating area.' },
    { xPct: 0.42, yPct: 0.72, scale: 0.34, reason: 'Dining table centred in the room.' },
  ],
  stool: [
    { xPct: 0.60, yPct: 0.64, scale: 0.13, reason: 'Accent stool as a flexible side piece.' },
    { xPct: 0.38, yPct: 0.62, scale: 0.12, reason: 'Ottoman stool in front of a chair.' },
    { xPct: 0.48, yPct: 0.66, scale: 0.13, reason: 'Stool used as a coffee table alternative.' },
  ],
  lamp: [
    { xPct: 0.84, yPct: 0.52, scale: 0.16, reason: 'Floor lamp in the corner for warm ambient lighting.' },
    { xPct: 0.06, yPct: 0.50, scale: 0.15, reason: 'Floor lamp on the left side for balanced lighting.' },
    { xPct: 0.55, yPct: 0.56, scale: 0.12, reason: 'Table lamp on a side table.' },
  ],
  decoration: [
    { xPct: 0.70, yPct: 0.54, scale: 0.09, reason: 'Decorative accent placed at eye level.' },
    { xPct: 0.18, yPct: 0.52, scale: 0.08, reason: 'Vase or plant in the corner for a natural touch.' },
    { xPct: 0.44, yPct: 0.50, scale: 0.08, reason: 'Centrepiece decoration on a surface.' },
    { xPct: 0.80, yPct: 0.56, scale: 0.07, reason: 'Small decorative item beside a lamp.' },
  ],
  cabinet: [
    { xPct: 0.05, yPct: 0.54, scale: 0.26, reason: 'Cabinet against the left wall for storage and display.' },
    { xPct: 0.86, yPct: 0.54, scale: 0.25, reason: 'Bookcase on the right wall.' },
    { xPct: 0.45, yPct: 0.50, scale: 0.24, reason: 'Cabinet centred against the back wall.' },
  ],
  rug: [
    { xPct: 0.40, yPct: 0.76, scale: 0.52, reason: 'Area rug anchoring the main seating zone.' },
    { xPct: 0.50, yPct: 0.78, scale: 0.58, reason: 'Large rug defining the central floor area.' },
  ],
  bed: [
    { xPct: 0.38, yPct: 0.68, scale: 0.33, reason: 'Bed placed centrally against the main wall.' },
    { xPct: 0.52, yPct: 0.70, scale: 0.36, reason: 'King bed centred in the bedroom.' },
  ],
  mirror: [
    { xPct: 0.10, yPct: 0.44, scale: 0.18, reason: 'Mirror leaning against the wall to add depth and light.' },
    { xPct: 0.80, yPct: 0.42, scale: 0.16, reason: 'Mirror on the right wall to visually expand the space.' },
  ],
};

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

  async suggestPlacement2d(dto: SuggestPlacement2dDto) {
    const key = dto.productCategory.toLowerCase();
    const rules = PLACEMENT_RULES[key] ?? [
      { xPct: 0.38, yPct: 0.62, scale: 0.22, reason: 'Balanced central placement.' },
    ];

    // Try Gemini vision placement when room image is available
    if (dto.roomImageUrl) {
      try {
        const geminiResult = await this.gemini.suggestFurniturePlacement2d(
          dto.productCategory,
          dto.roomImageUrl,
        );
        if (geminiResult) {
          return {
            success: true,
            data: {
              x: Math.round(geminiResult.xPct * dto.canvasWidth),
              y: Math.round(geminiResult.yPct * dto.canvasHeight),
              scale: geminiResult.scale,
              rotation: geminiResult.rotation,
              reason: `AI placement: ${geminiResult.reason}`,
            },
          };
        }
      } catch { /* fall through to rule-based */ }
    }

    // Rule-based: cycle through positions so same category doesn't stack
    const count = dto.existingCount ?? 0;
    const rule = rules[count % rules.length];
    return {
      success: true,
      data: {
        x: Math.round(rule.xPct * dto.canvasWidth),
        y: Math.round(rule.yPct * dto.canvasHeight),
        scale: rule.scale,
        rotation: 0,
        reason: rule.reason,
      },
    };
  }

  async processProductImage(imageUrl: string) {
    const apiKey = process.env.CLIPDROP_API_KEY;
    if (!apiKey) {
      this.logger.warn('CLIPDROP_API_KEY not set — background removal skipped');
      return { success: true, data: null };
    }

    try {
      // Fetch source image as buffer
      const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
      const contentType = (imgRes.headers['content-type'] as string) || 'image/jpeg';

      // Send to Clipdrop remove-background API
      const form = new FormData();
      form.append('image_file', Buffer.from(imgRes.data), {
        filename: 'product.jpg',
        contentType,
      });

      const result = await axios.post(
        'https://clipdrop-api.co/remove-background/v1',
        form,
        {
          headers: { ...form.getHeaders(), 'x-api-key': apiKey },
          responseType: 'arraybuffer',
          timeout: 30000,
        },
      );

      const base64 = Buffer.from(result.data).toString('base64');
      return { success: true, data: { cleanImageDataUrl: `data:image/png;base64,${base64}` } };
    } catch (err: any) {
      this.logger.error('Clipdrop BG removal failed: ' + (err?.response?.status ?? err?.message));
      return { success: true, data: null };
    }
  }

  async saveAiDesign(dto: SaveAiDesignDto, userId: number) {
    const design = this.aiDesignRepo.create({
      userId,
      productId: dto.productId,
      productName: dto.productName,
      roomImageUrl: dto.roomImageUrl,
      resultImageUrl: dto.resultImageUrl,
      roomAnalysis: dto.roomAnalysis ?? {},
      placement: dto.placement ?? {},
      roomType: (dto.roomAnalysis as any)?.roomType ?? null,
      roomStyle: (dto.roomAnalysis as any)?.style ?? null,
    });
    const saved = await this.aiDesignRepo.save(design);
    return { success: true, data: { id: saved.id, createdAt: saved.createdAt } };
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
