import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface ProductRecommendation {
  suggestedCategories: string[];
  reason: string;
}

const VALID_CATEGORIES = ['sofa', 'chair', 'table', 'stool', 'decoration', 'cabinet'];

const FALLBACKS: Record<string, ProductRecommendation> = {
  living_room: {
    suggestedCategories: ['sofa', 'table', 'decoration'],
    reason: 'A living room works best with a sofa, coffee table, and decorative accents.',
  },
  bedroom: {
    suggestedCategories: ['table', 'cabinet', 'decoration'],
    reason: 'A bedroom needs bedside tables, a wardrobe, and soft decorative touches.',
  },
  dining_room: {
    suggestedCategories: ['table', 'chair', 'cabinet'],
    reason: 'A dining room centers around a dining table, chairs, and a sideboard cabinet.',
  },
};

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey = process.env.GEMINI_API_KEY;
  private readonly endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  async recommendProducts(
    roomType: string,
    alreadyPlaced: string[],
  ): Promise<ProductRecommendation> {
    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY not set, using fallback');
      return FALLBACKS[roomType] ?? FALLBACKS['living_room'];
    }

    const alreadyStr =
      alreadyPlaced.length > 0
        ? `Already placed: ${alreadyPlaced.join(', ')}.`
        : 'Nothing placed yet.';

    const prompt =
      `You are an interior designer. Room type: ${roomType.replace('_', ' ')}. ${alreadyStr}\n` +
      `Recommend up to 3 furniture categories to add next.\n` +
      `Available categories (use only these exact values): ${VALID_CATEGORIES.join(', ')}.\n` +
      `Return ONLY valid JSON with no markdown:\n` +
      `{"suggestedCategories":["sofa","table"],"reason":"One sentence explanation."}`;

    try {
      const response = await axios.post(
        `${this.endpoint}?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
        },
        { timeout: 7000 },
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      const categories = (parsed.suggestedCategories as string[])
        .filter((c) => VALID_CATEGORIES.includes(c.toLowerCase()))
        .slice(0, 3);

      return {
        suggestedCategories: categories.length > 0 ? categories : (FALLBACKS[roomType]?.suggestedCategories ?? []),
        reason: typeof parsed.reason === 'string' ? parsed.reason : '',
      };
    } catch (err: any) {
      this.logger.warn('Gemini failed, using fallback: ' + err?.message);
      return FALLBACKS[roomType] ?? FALLBACKS['living_room'];
    }
  }
}
