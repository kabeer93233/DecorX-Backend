import { Injectable } from '@nestjs/common';

@Injectable()

export class AiPreviewService {

  async getPreview() {

    return {

      message:
      'AI Preview Access Granted',
    };
  }
}