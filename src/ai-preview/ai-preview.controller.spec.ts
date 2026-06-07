import { Test, TestingModule } from '@nestjs/testing';
import { AiPreviewController } from './ai-preview.controller';

describe('AiPreviewController', () => {
  let controller: AiPreviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiPreviewController],
    }).compile();

    controller = module.get<AiPreviewController>(AiPreviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
