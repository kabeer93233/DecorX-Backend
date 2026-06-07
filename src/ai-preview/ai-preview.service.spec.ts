import { Test, TestingModule } from '@nestjs/testing';
import { AiPreviewService } from './ai-preview.service';

describe('AiPreviewService', () => {
  let service: AiPreviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiPreviewService],
    }).compile();

    service = module.get<AiPreviewService>(AiPreviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
