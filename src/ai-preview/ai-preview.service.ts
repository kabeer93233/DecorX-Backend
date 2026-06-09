import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedDesign } from './entities/saved-design.entity';
import { GeminiService } from './gemini.service';
import { PlacementService } from './placement.service';
import { SuggestPlacementDto } from './dto/suggest-placement.dto';
import { RecommendProductsDto } from './dto/recommend-products.dto';
import { SaveDesignDto } from './dto/save-design.dto';

@Injectable()
export class AiPreviewService {
  constructor(
    @InjectRepository(SavedDesign)
    private readonly designRepo: Repository<SavedDesign>,
    private readonly gemini: GeminiService,
    private readonly placement: PlacementService,
  ) {}

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
      userId,
      roomId: dto.roomId,
      name: dto.name ?? 'My Design',
      items: dto.items,
      cameraState: dto.cameraState ?? null,
      screenshotUrl: dto.screenshotUrl ?? null,
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
}
