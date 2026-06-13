import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedDesign } from './entities/saved-design.entity';
import { AiDesign } from './entities/ai-design.entity';
import { GeminiService } from './gemini.service';
import { PlacementService } from './placement.service';
import { SuggestPlacementDto } from './dto/suggest-placement.dto';
import { RecommendProductsDto } from './dto/recommend-products.dto';
import { SaveDesignDto } from './dto/save-design.dto';
import { AnalyzeRoomDto } from './dto/analyze-room.dto';
import { SuggestPlacement2dDto } from './dto/suggest-placement-2d.dto';
import { SaveAiDesignDto } from './dto/save-ai-design.dto';
import { PlaceItemDto } from './dto/place-item.dto';

// 2D canvas placement rules — multiple positions per category to avoid stacking
const PLACEMENT_RULES: Record<string, Array<{ xPct: number; yPct: number; scale: number; reason: string }>> = {
  sofa:       [
    { xPct: 0.22, yPct: 0.60, scale: 0.62, reason: 'Sofa placed against the main wall for a classic living room arrangement.' },
    { xPct: 0.55, yPct: 0.60, scale: 0.58, reason: 'Second sofa creating an L-shaped seating area.' },
  ],
  loveseat:   [
    { xPct: 0.25, yPct: 0.58, scale: 0.50, reason: 'Loveseat near the main wall to complement the seating area.' },
    { xPct: 0.62, yPct: 0.56, scale: 0.46, reason: 'Loveseat angled for a cozy conversation corner.' },
  ],
  chair:      [
    { xPct: 0.62, yPct: 0.54, scale: 0.38, reason: 'Chair to the right — complements a sofa or accent table.' },
    { xPct: 0.12, yPct: 0.52, scale: 0.36, reason: 'Accent chair in the left corner for balance.' },
    { xPct: 0.75, yPct: 0.58, scale: 0.36, reason: 'Reading chair in the far corner.' },
  ],
  table:      [
    { xPct: 0.38, yPct: 0.56, scale: 0.46, reason: 'Coffee table centred between seating areas.' },
    { xPct: 0.20, yPct: 0.48, scale: 0.38, reason: 'Side table next to the sofa for convenience.' },
  ],
  stool:      [
    { xPct: 0.62, yPct: 0.56, scale: 0.28, reason: 'Accent stool as a flexible side piece.' },
    { xPct: 0.42, yPct: 0.52, scale: 0.26, reason: 'Ottoman stool in front of a chair.' },
  ],
  lamp:       [
    { xPct: 0.78, yPct: 0.42, scale: 0.26, reason: 'Floor lamp in the corner for warm ambient lighting.' },
    { xPct: 0.08, yPct: 0.40, scale: 0.24, reason: 'Table lamp on the left side for balanced lighting.' },
  ],
  decoration: [
    { xPct: 0.72, yPct: 0.38, scale: 0.22, reason: 'Decorative piece placed at eye level as an accent.' },
    { xPct: 0.18, yPct: 0.36, scale: 0.20, reason: 'Vase or plant in the corner for a natural touch.' },
  ],
  cabinet:    [
    { xPct: 0.06, yPct: 0.38, scale: 0.52, reason: 'Cabinet against the left wall for storage and display.' },
    { xPct: 0.82, yPct: 0.38, scale: 0.50, reason: 'Bookcase on the right wall.' },
  ],
  rug:        [
    { xPct: 0.35, yPct: 0.65, scale: 0.82, reason: 'Area rug anchoring the seating zone.' },
  ],
};

@Injectable()
export class AiPreviewService {
  constructor(
    @InjectRepository(SavedDesign)
    private readonly designRepo: Repository<SavedDesign>,
    @InjectRepository(AiDesign)
    private readonly aiDesignRepo: Repository<AiDesign>,
    private readonly gemini: GeminiService,
    private readonly placement: PlacementService,
  ) {}

  // ── 3D EDITOR ENDPOINTS ───────────────────────────────────────────

  async recommendProducts(dto: RecommendProductsDto) {
    const result = await this.gemini.recommendProducts(
      dto.roomType,
      dto.alreadyPlacedCategories ?? [],
    );
    return { success: true, data: result };
  }

  suggestPlacement(dto: SuggestPlacementDto) {
    const result = this.placement.suggest(
      dto.roomId,
      dto.productCategory,
      dto.productWidth,
      dto.productDepth,
      dto.existingItems ?? [],
    );
    return { success: true, data: result };
  }

  async saveDesign(dto: SaveDesignDto, userId: number) {
    if (dto.designId) {
      const design = await this.designRepo.findOne({ where: { id: dto.designId } });
      if (!design) throw new NotFoundException('Design not found');
      if (design.userId !== userId) throw new ForbiddenException();
      await this.designRepo.update(dto.designId, {
        items: dto.items,
        cameraState: dto.cameraState ?? null,
        screenshotUrl: dto.screenshotUrl ?? null,
        name: dto.name ?? design.name,
      });
      return { success: true, data: { id: dto.designId } };
    }
    const design = this.designRepo.create({
      userId, roomId: dto.roomId, name: dto.name ?? 'My Design',
      items: dto.items, cameraState: dto.cameraState ?? null, screenshotUrl: dto.screenshotUrl ?? null,
    });
    const saved = await this.designRepo.save(design);
    return { success: true, data: { id: saved.id, createdAt: saved.createdAt } };
  }

  async getMyDesigns(userId: number) {
    const designs = await this.designRepo.find({
      where: { userId, isDeleted: false },
      order: { updatedAt: 'DESC' },
      select: ['id', 'roomId', 'name', 'screenshotUrl', 'createdAt', 'updatedAt'],
    });
    return { success: true, data: designs };
  }

  async getDesign(id: string, userId: number) {
    const design = await this.designRepo.findOne({ where: { id, isDeleted: false } });
    if (!design) throw new NotFoundException('Design not found');
    if (design.userId !== userId) throw new ForbiddenException();
    return { success: true, data: design };
  }

  async deleteDesign(id: string, userId: number) {
    const design = await this.designRepo.findOne({ where: { id } });
    if (!design) throw new NotFoundException();
    if (design.userId !== userId) throw new ForbiddenException();
    await this.designRepo.update(id, { isDeleted: true });
    return { success: true };
  }

  // ── 2D AI DESIGNER ENDPOINTS ──────────────────────────────────────

  async analyzeRoom(dto: AnalyzeRoomDto) {
    const analysis = await this.gemini.analyzeRoom(dto.roomImageUrl);
    return { success: true, data: analysis };
  }

  async placeItem(dto: PlaceItemDto) {
    const result = await this.gemini.placeItem(
      dto.roomImageUrl,
      dto.productName,
      dto.productCategory,
      dto.productWidthCm,
      dto.productHeightCm,
      dto.floorLineY,
      dto.existingItems ?? [],
    );
    return { success: true, data: result };
  }

  async suggestPlacement2d(dto: SuggestPlacement2dDto) {
    // Rule-based fallback — placement is now driven client-side via AI geometry zones
    const key   = dto.productCategory.toLowerCase();
    const rules = PLACEMENT_RULES[key] ?? [{ xPct: 0.35, yPct: 0.60, scale: 0.48, reason: 'Balanced central placement.' }];
    const rule  = rules[0];
    return {
      success: true,
      data: {
        x:      Math.round(rule.xPct * dto.canvasWidth),
        y:      Math.round(rule.yPct * dto.canvasHeight),
        scale:  rule.scale,
        rotation: 0,
        reason: rule.reason,
      },
    };
  }

  async processProductImage(imageUrl: string) {
    const box = await this.gemini.getProductBoundingBox(imageUrl);
    return { success: true, data: box };
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
