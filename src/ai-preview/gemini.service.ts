import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

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

const ROOM_ANALYSIS_PROMPT =
  `Analyze this interior room photo and return ONLY valid JSON with no markdown:\n` +
  `{"roomType":"living room","style":"modern","dominantColors":["#f5f0eb","#3d3d3d"],"existingFurniture":["sofa"],` +
  `"lightingCondition":"natural","floorType":"hardwood","suggestedCategories":["lamp","chair"],"reason":"One sentence.",` +
  `"wallHexColor":"#EDE3D5","floorHexColor":"#C4A478"}\n` +
  `roomType: one of: living room, bedroom, dining room, office, studio\n` +
  `style: one of: modern, minimalist, traditional, industrial, bohemian, scandinavian\n` +
  `suggestedCategories: up to 3 from ONLY: sofa, chair, table, lamp, cabinet, stool, decoration\n` +
  `wallHexColor/floorHexColor: hex colors matching what you see in the photo`;

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  private readonly groqKey       = process.env.GROQ_API_KEY;
  private readonly openrouterKey = process.env.OPENROUTER_API_KEY;

  private async visionCall(opts: {
    provider: 'groq' | 'openrouter';
    model:    string;
    base64:   string;
    mimeType: string;
    prompt:   string;
    maxTokens?: number;
  }): Promise<string> {
    const endpoint = opts.provider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://openrouter.ai/api/v1/chat/completions';

    const apiKey = opts.provider === 'groq' ? this.groqKey! : this.openrouterKey!;

    const headers: Record<string, string> = {
      Authorization:  `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
    if (opts.provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://decorx.app';
      headers['X-Title']      = 'DecorX AI Room Designer';
    }

    const res = await axios.post(
      endpoint,
      {
        model:    opts.model,
        messages: [{
          role:    'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${opts.mimeType};base64,${opts.base64}` } },
            { type: 'text', text: opts.prompt },
          ],
        }],
        max_tokens:  opts.maxTokens ?? 400,
        temperature: 0.1,
      },
      { headers, timeout: 22000 },
    );

    return res.data?.choices?.[0]?.message?.content ?? '';
  }

  private async callWithFallback(prompt: string, base64: string, mimeType: string, maxTokens = 400): Promise<string> {
    if (this.groqKey) {
      try {
        return await this.visionCall({ provider: 'groq', model: 'meta-llama/llama-4-scout-17b-16e-instruct', base64, mimeType, prompt, maxTokens });
      } catch (err: any) {
        this.logger.warn('Groq failed: ' + err?.message);
      }
    }

    if (this.openrouterKey) {
      return await this.visionCall({ provider: 'openrouter', model: 'google/gemini-2.0-flash-exp:free', base64, mimeType, prompt, maxTokens });
    }

    throw new Error('No AI provider configured. Set GROQ_API_KEY or OPENROUTER_API_KEY in .env');
  }

  private async fetchImageBase64(imageUrl: string): Promise<{ base64: string; mimeType: string }> {
    const res      = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 12000 });
    const mimeType = ((res.headers['content-type'] as string) || 'image/jpeg').split(';')[0].trim();
    return { base64: Buffer.from(res.data).toString('base64'), mimeType };
  }

  async analyzeRoom(imageUrl: string): Promise<RoomAnalysis> {
    try {
      const { base64, mimeType } = await this.fetchImageBase64(imageUrl);
      const text   = await this.callWithFallback(ROOM_ANALYSIS_PROMPT, base64, mimeType, 400);
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      this.logger.log('Room analyzed successfully');
      return {
        roomType:            parsed.roomType           ?? FALLBACK_ANALYSIS.roomType,
        style:               parsed.style              ?? FALLBACK_ANALYSIS.style,
        dominantColors:      Array.isArray(parsed.dominantColors)    ? parsed.dominantColors.slice(0, 4)    : FALLBACK_ANALYSIS.dominantColors,
        existingFurniture:   Array.isArray(parsed.existingFurniture) ? parsed.existingFurniture              : [],
        lightingCondition:   parsed.lightingCondition  ?? FALLBACK_ANALYSIS.lightingCondition,
        floorType:           parsed.floorType          ?? FALLBACK_ANALYSIS.floorType,
        suggestedCategories: Array.isArray(parsed.suggestedCategories) ? parsed.suggestedCategories.slice(0, 3) : FALLBACK_ANALYSIS.suggestedCategories,
        reason:              typeof parsed.reason       === 'string'  ? parsed.reason                        : '',
        wallHexColor:        typeof parsed.wallHexColor === 'string'  ? parsed.wallHexColor                  : FALLBACK_ANALYSIS.wallHexColor,
        floorHexColor:       typeof parsed.floorHexColor === 'string' ? parsed.floorHexColor                 : FALLBACK_ANALYSIS.floorHexColor,
      };
    } catch (err: any) {
      this.logger.error('Room analysis failed: ' + err?.message);
      return FALLBACK_ANALYSIS;
    }
  }
}
