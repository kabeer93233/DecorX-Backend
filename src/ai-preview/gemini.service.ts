import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface ProductRecommendation {
  suggestedCategories: string[];
  reason: string;
}

export interface RoomAnalysis {
  roomType: string;
  style: string;
  dominantColors: string[];
  existingFurniture: string[];
  lightingCondition: string;
  floorType: string;
  suggestedCategories: string[];
  reason: string;
  wallHexColor: string;
  floorHexColor: string;
}

const FALLBACK_ANALYSIS: RoomAnalysis = {
  roomType: 'living room',
  style: 'modern',
  dominantColors: ['#f5f0eb', '#3d3d3d', '#c8b8a2'],
  existingFurniture: [],
  lightingCondition: 'natural',
  floorType: 'unknown',
  suggestedCategories: ['sofa', 'lamp', 'table'],
  reason: 'AI suggests furniture that works well in most living spaces.',
  wallHexColor: '#EDE3D5',
  floorHexColor: '#C4A478',
};

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

  async getProductBoundingBox(imageUrl: string): Promise<{ x1: number; y1: number; x2: number; y2: number } | null> {
    if (!this.apiKey) return null;
    try {
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 5000 });
      const imageBase64 = Buffer.from(imageResponse.data).toString('base64');
      const mimeType = (imageResponse.headers['content-type'] as string) || 'image/jpeg';

      const prompt =
        `Find the main furniture/product in this image and return ONLY valid JSON with no markdown:\n` +
        `{"x1":0.1,"y1":0.05,"x2":0.9,"y2":0.95}\n` +
        `x1,y1 = top-left corner as fraction (0-1) of image width/height.\n` +
        `x2,y2 = bottom-right corner as fraction (0-1).\n` +
        `Exclude white/blank background. Tight crop around the product only.\n` +
        `If no product found: {"x1":0.02,"y1":0.02,"x2":0.98,"y2":0.98}`;

      const response = await axios.post(
        `${this.endpoint}?key=${this.apiKey}`,
        { contents: [{ parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: prompt }] }],
          generationConfig: { temperature: 0.0, maxOutputTokens: 100 } },
        { timeout: 7000 },
      );
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      const clamp = (v: number) => Math.max(0, Math.min(1, v));
      return { x1: clamp(parsed.x1), y1: clamp(parsed.y1), x2: clamp(parsed.x2), y2: clamp(parsed.y2) };
    } catch {
      return null;
    }
  }

  async suggestFurniturePlacement2d(
    productCategory: string,
    roomImageUrl: string,
  ): Promise<{ xPct: number; yPct: number; scale: number; rotation: number; reason: string } | null> {
    if (!this.apiKey) return null;
    try {
      const imageResponse = await axios.get(roomImageUrl, { responseType: 'arraybuffer', timeout: 5000 });
      const imageBase64 = Buffer.from(imageResponse.data).toString('base64');
      const mimeType = (imageResponse.headers['content-type'] as string) || 'image/jpeg';

      const prompt =
        `You are an interior designer. Look at this room photo and suggest the best position to place a ${productCategory}.\n` +
        `Return ONLY valid JSON with no markdown:\n` +
        `{"xPct":0.3,"yPct":0.65,"scale":0.55,"rotation":0,"reason":"One sentence."}\n` +
        `xPct,yPct = center position as fraction (0-1) of canvas width/height.\n` +
        `yPct must be 0.45-0.82 (floor area, not ceiling). xPct must be 0.05-0.95.\n` +
        `scale = 0.2-0.8 (relative size fitting the room perspective).\n` +
        `rotation = 0 for most items.\n` +
        `Place the ${productCategory} in the most realistic and aesthetically pleasing spot.`;

      const response = await axios.post(
        `${this.endpoint}?key=${this.apiKey}`,
        { contents: [{ parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 150 } },
        { timeout: 8000 },
      );
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      return {
        xPct:   Math.max(0.05, Math.min(0.95, parsed.xPct ?? 0.35)),
        yPct:   Math.max(0.45, Math.min(0.82, parsed.yPct ?? 0.60)),
        scale:  Math.max(0.15, Math.min(0.85, parsed.scale ?? 0.50)),
        rotation: parsed.rotation ?? 0,
        reason: parsed.reason ?? `${productCategory} placed in an optimal position.`,
      };
    } catch {
      return null;
    }
  }

  async analyzeRoom(imageUrl: string): Promise<RoomAnalysis> {
    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY not set, returning fallback room analysis');
      return FALLBACK_ANALYSIS;
    }
    try {
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 5000,
      });
      const imageBase64 = Buffer.from(imageResponse.data).toString('base64');
      const mimeType = (imageResponse.headers['content-type'] as string) || 'image/jpeg';

      const prompt =
        `Analyze this room photo and return ONLY valid JSON with no markdown, no explanation:\n` +
        `{"roomType":"living room","style":"modern","dominantColors":["#f5f0eb","#3d3d3d"],"existingFurniture":["sofa"],"lightingCondition":"natural","floorType":"hardwood","suggestedCategories":["lamp","rug"],"reason":"Brief reason.","wallHexColor":"#EDE3D5","floorHexColor":"#C4A478"}\n` +
        `roomType: one of: living room, bedroom, dining room, office, studio\n` +
        `style: one of: modern, minimalist, traditional, industrial, bohemian, scandinavian, classic\n` +
        `suggestedCategories: up to 3 from: sofa, chair, table, lamp, cabinet, stool, decoration\n` +
        `wallHexColor: a hex color code matching the wall color visible in the photo (e.g. "#EDE3D5")\n` +
        `floorHexColor: a hex color code matching the floor color visible in the photo (e.g. "#C4A478")`;

      const response = await axios.post(
        `${this.endpoint}?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 400 },
        },
        { timeout: 8000 },
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        roomType: parsed.roomType ?? FALLBACK_ANALYSIS.roomType,
        style: parsed.style ?? FALLBACK_ANALYSIS.style,
        dominantColors: Array.isArray(parsed.dominantColors) ? parsed.dominantColors.slice(0, 4) : FALLBACK_ANALYSIS.dominantColors,
        existingFurniture: Array.isArray(parsed.existingFurniture) ? parsed.existingFurniture : [],
        lightingCondition: parsed.lightingCondition ?? FALLBACK_ANALYSIS.lightingCondition,
        floorType: parsed.floorType ?? FALLBACK_ANALYSIS.floorType,
        suggestedCategories: Array.isArray(parsed.suggestedCategories) ? parsed.suggestedCategories.slice(0, 3) : FALLBACK_ANALYSIS.suggestedCategories,
        reason: parsed.reason ?? FALLBACK_ANALYSIS.reason,
        wallHexColor: typeof parsed.wallHexColor === 'string' ? parsed.wallHexColor : FALLBACK_ANALYSIS.wallHexColor,
        floorHexColor: typeof parsed.floorHexColor === 'string' ? parsed.floorHexColor : FALLBACK_ANALYSIS.floorHexColor,
      };
    } catch (err: any) {
      this.logger.error('analyzeRoom failed: ' + err?.message);
      return FALLBACK_ANALYSIS;
    }
  }
}
