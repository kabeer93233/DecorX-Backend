import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface RoomGeometry {
  floorLineY: number;
  vanishingPoint: { x: number; y: number };
  placementZones: Record<string, { x: number; y: number }>;
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
  geometry: RoomGeometry;
}

export interface ProductRecommendation {
  suggestedCategories: string[];
  reason: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const GROQ_ENDPOINT        = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_ENDPOINT  = 'https://openrouter.ai/api/v1/chat/completions';
const GROQ_VISION_MODEL    = 'meta-llama/llama-4-scout-17b-16e-instruct';
const OPENROUTER_MODEL     = 'google/gemini-2.0-flash-exp:free';
const GROQ_TEXT_MODEL      = 'llama3-8b-8192';

const VALID_CATEGORIES = ['sofa', 'chair', 'table', 'lamp', 'stool', 'decoration', 'cabinet', 'bed', 'rug'];

const DEFAULT_GEOMETRY: RoomGeometry = {
  floorLineY: 0.63,
  vanishingPoint: { x: 0.50, y: 0.38 },
  placementZones: {
    sofa:    { x: 0.24, y: 0.72 },
    chair:   { x: 0.72, y: 0.70 },
    table:   { x: 0.44, y: 0.68 },
    lamp:    { x: 0.82, y: 0.65 },
    cabinet: { x: 0.07, y: 0.65 },
    bed:     { x: 0.40, y: 0.74 },
    stool:   { x: 0.55, y: 0.70 },
    rug:     { x: 0.42, y: 0.78 },
    decoration: { x: 0.68, y: 0.65 },
  },
};

const FALLBACK_ANALYSIS: RoomAnalysis = {
  roomType: 'living room',
  style: 'modern',
  dominantColors: ['#f5f0eb', '#3d3d3d', '#c8b8a2'],
  existingFurniture: [],
  lightingCondition: 'natural',
  floorType: 'unknown',
  suggestedCategories: ['sofa', 'lamp', 'table'],
  reason: 'Could not analyze room automatically. Showing default suggestions.',
  wallHexColor: '#EDE3D5',
  floorHexColor: '#C4A478',
  geometry: DEFAULT_GEOMETRY,
};

const FALLBACK_RECOMMENDATIONS: Record<string, ProductRecommendation> = {
  living_room: { suggestedCategories: ['sofa', 'table', 'lamp'],    reason: 'A living room works best with a sofa, coffee table, and a lamp.' },
  bedroom:     { suggestedCategories: ['bed', 'cabinet', 'lamp'],   reason: 'A bedroom needs a bed, wardrobe, and bedside lamp.' },
  dining_room: { suggestedCategories: ['table', 'chair', 'cabinet'],reason: 'A dining room centres around a table, chairs, and a sideboard.' },
  office:      { suggestedCategories: ['table', 'chair', 'lamp'],   reason: 'An office needs a desk, ergonomic chair, and good lighting.' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function isNum(v: unknown): v is number {
  return typeof v === 'number' && !isNaN(v);
}

async function toBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
  const mime = (res.headers['content-type'] as string) || 'image/jpeg';
  return { data: Buffer.from(res.data).toString('base64'), mimeType: mime };
}

function parseGeometry(raw: any, fallbackFloorY = 0.63): RoomGeometry {
  const floorLineY = isNum(raw?.floorLineY) ? clamp(raw.floorLineY, 0.42, 0.85) : fallbackFloorY;
  const vpX        = isNum(raw?.vanishingPoint?.x) ? clamp(raw.vanishingPoint.x, 0.15, 0.85) : 0.50;
  const vpY        = isNum(raw?.vanishingPoint?.y) ? clamp(raw.vanishingPoint.y, 0.18, 0.58) : 0.38;

  const rawZones = raw?.placementZones ?? {};
  const zones: Record<string, { x: number; y: number }> = {};

  for (const [key, def] of Object.entries(DEFAULT_GEOMETRY.placementZones)) {
    const rz = rawZones[key];
    zones[key] = {
      x: isNum(rz?.x) ? clamp(rz.x, 0.04, 0.94) : def.x,
      y: isNum(rz?.y) ? clamp(rz.y, floorLineY, 0.92) : def.y,
    };
  }

  return { floorLineY, vanishingPoint: { x: vpX, y: vpY }, placementZones: zones };
}

// ── Shared vision call (Groq primary → OpenRouter fallback) ───────────────────

async function callVisionAI(
  base64: string,
  mimeType: string,
  prompt: string,
  groqKey: string,
  openrouterKey: string,
  logger: Logger,
  maxTokens = 900,
): Promise<string> {
  const imageUrl = `data:${mimeType};base64,${base64}`;

  const body = (model: string) => ({
    model,
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: imageUrl } },
        { type: 'text', text: prompt },
      ],
    }],
    temperature: 0.1,
    max_tokens: maxTokens,
  });

  // Primary: Groq
  try {
    const res = await axios.post(GROQ_ENDPOINT, body(GROQ_VISION_MODEL), {
      headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      timeout: 25000,
    });
    return res.data?.choices?.[0]?.message?.content ?? '';
  } catch (err: any) {
    logger.warn(`Groq vision failed: ${err?.message} — trying OpenRouter`);
  }

  // Fallback: OpenRouter
  const res = await axios.post(OPENROUTER_ENDPOINT, body(OPENROUTER_MODEL), {
    headers: {
      Authorization: `Bearer ${openrouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://decorx.vercel.app',
    },
    timeout: 30000,
  });
  return res.data?.choices?.[0]?.message?.content ?? '';
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly groqKey        = process.env.GROQ_API_KEY ?? '';
  private readonly openrouterKey  = process.env.OPENROUTER_API_KEY ?? '';

  // ── Room analysis with spatial geometry ──────────────────────────────────────

  async analyzeRoom(imageUrl: string): Promise<RoomAnalysis> {
    if (!this.groqKey && !this.openrouterKey) {
      this.logger.warn('No AI keys configured — returning fallback');
      return FALLBACK_ANALYSIS;
    }

    try {
      const { data, mimeType } = await toBase64(imageUrl);

      const prompt =
        `You are an expert interior designer and computer vision AI. Analyze this room photo carefully.
Return ONLY a single valid JSON object — no markdown, no explanation, no extra text.

JSON schema (fill every field):
{
  "roomType": "living room",
  "style": "modern",
  "dominantColors": ["#hex1","#hex2","#hex3"],
  "existingFurniture": ["sofa","window"],
  "lightingCondition": "natural",
  "floorType": "hardwood",
  "suggestedCategories": ["lamp","table"],
  "reason": "One sentence why.",
  "wallHexColor": "#EDE3D5",
  "floorHexColor": "#C4A478",
  "geometry": {
    "floorLineY": 0.63,
    "vanishingPoint": { "x": 0.50, "y": 0.38 },
    "placementZones": {
      "sofa":       { "x": 0.24, "y": 0.72 },
      "chair":      { "x": 0.72, "y": 0.70 },
      "table":      { "x": 0.44, "y": 0.68 },
      "lamp":       { "x": 0.82, "y": 0.65 },
      "cabinet":    { "x": 0.07, "y": 0.65 },
      "bed":        { "x": 0.40, "y": 0.74 },
      "stool":      { "x": 0.55, "y": 0.70 },
      "rug":        { "x": 0.42, "y": 0.78 },
      "decoration": { "x": 0.68, "y": 0.65 }
    }
  }
}

Field rules:
- roomType: one of: living room, bedroom, dining room, office, studio
- style: one of: modern, minimalist, traditional, industrial, bohemian, scandinavian, classic
- suggestedCategories: up to 3 from: ${VALID_CATEGORIES.join(', ')}
- wallHexColor / floorHexColor: exact hex color matching what you see in the photo
- geometry.floorLineY: fraction (0–1) of image height where the floor meets the back wall (horizon of the floor)
- geometry.vanishingPoint: perspective vanishing point as fractions of image width (x) and height (y)
- geometry.placementZones: for EACH category, the ideal center position (x,y as fractions 0–1) to place that furniture type so it looks naturally in the room. y = where the item's base (feet) would touch the floor at that depth. Consider walls, corners, windows, and existing furniture — place items where they realistically belong. sofa/cabinet near back wall (lower y), items in front (higher y). Lamps near corners.`;

      const raw = await callVisionAI(data, mimeType, prompt, this.groqKey, this.openrouterKey, this.logger);
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      const suggestedCategories = (Array.isArray(parsed.suggestedCategories) ? parsed.suggestedCategories : [])
        .filter((c: string) => VALID_CATEGORIES.includes(c.toLowerCase()))
        .slice(0, 3);

      return {
        roomType:          typeof parsed.roomType === 'string'           ? parsed.roomType          : FALLBACK_ANALYSIS.roomType,
        style:             typeof parsed.style === 'string'              ? parsed.style             : FALLBACK_ANALYSIS.style,
        dominantColors:    Array.isArray(parsed.dominantColors)          ? parsed.dominantColors.slice(0, 4) : FALLBACK_ANALYSIS.dominantColors,
        existingFurniture: Array.isArray(parsed.existingFurniture)       ? parsed.existingFurniture : [],
        lightingCondition: typeof parsed.lightingCondition === 'string'  ? parsed.lightingCondition : FALLBACK_ANALYSIS.lightingCondition,
        floorType:         typeof parsed.floorType === 'string'          ? parsed.floorType         : FALLBACK_ANALYSIS.floorType,
        suggestedCategories: suggestedCategories.length ? suggestedCategories : FALLBACK_ANALYSIS.suggestedCategories,
        reason:            typeof parsed.reason === 'string'             ? parsed.reason            : FALLBACK_ANALYSIS.reason,
        wallHexColor:      typeof parsed.wallHexColor === 'string'       ? parsed.wallHexColor      : FALLBACK_ANALYSIS.wallHexColor,
        floorHexColor:     typeof parsed.floorHexColor === 'string'      ? parsed.floorHexColor     : FALLBACK_ANALYSIS.floorHexColor,
        geometry:          parseGeometry(parsed.geometry, isNum(parsed.geometry?.floorLineY) ? parsed.geometry.floorLineY : 0.63),
      };
    } catch (err: any) {
      this.logger.error(`analyzeRoom failed: ${err?.message}`);
      return FALLBACK_ANALYSIS;
    }
  }

  // ── Text-only product recommendation (no vision needed) ──────────────────────

  async recommendProducts(roomType: string, alreadyPlaced: string[]): Promise<ProductRecommendation> {
    if (!this.groqKey) {
      return FALLBACK_RECOMMENDATIONS[roomType] ?? FALLBACK_RECOMMENDATIONS['living_room'];
    }

    const alreadyStr = alreadyPlaced.length
      ? `Already placed: ${alreadyPlaced.join(', ')}.`
      : 'Nothing placed yet.';

    const prompt =
      `You are an interior designer. Room type: ${roomType.replace('_', ' ')}. ${alreadyStr}\n` +
      `Recommend up to 3 furniture categories to add next.\n` +
      `Available categories (use only these exact values): ${VALID_CATEGORIES.join(', ')}.\n` +
      `Return ONLY valid JSON with no markdown:\n` +
      `{"suggestedCategories":["sofa","table"],"reason":"One sentence explanation."}`;

    try {
      const res = await axios.post(GROQ_ENDPOINT, {
        model: GROQ_TEXT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
      }, {
        headers: { Authorization: `Bearer ${this.groqKey}`, 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      const text    = res.data?.choices?.[0]?.message?.content ?? '';
      const parsed  = JSON.parse(text.replace(/```json|```/g, '').trim());
      const cats    = (parsed.suggestedCategories as string[])
        .filter(c => VALID_CATEGORIES.includes(c.toLowerCase()))
        .slice(0, 3);

      return {
        suggestedCategories: cats.length ? cats : (FALLBACK_RECOMMENDATIONS[roomType]?.suggestedCategories ?? []),
        reason: typeof parsed.reason === 'string' ? parsed.reason : '',
      };
    } catch (err: any) {
      this.logger.warn(`recommendProducts failed: ${err?.message}`);
      return FALLBACK_RECOMMENDATIONS[roomType] ?? FALLBACK_RECOMMENDATIONS['living_room'];
    }
  }

  // ── AI-driven per-item placement ─────────────────────────────────────────────

  async placeItem(
    roomImageUrl: string,
    productName: string,
    category: string,
    widthCm: number,
    heightCm: number,
    floorLineY: number,
    existingItems: Array<{ cx: number; cy: number; scale: number; category: string; productName: string }>,
    canvasW = 900,
    canvasH = 600,
  ): Promise<{ cx: number; cy: number; scale: number; reason: string }> {
    const DEFAULT = this.defaultPlacement(category, existingItems.length, floorLineY, widthCm, canvasW, canvasH);

    if (!this.groqKey && !this.openrouterKey) return DEFAULT;

    const floorYpx    = Math.round(floorLineY * canvasH);
    const isCeiling   = /pendant|chandelier/i.test(productName + category);
    const isTableLamp = /table lamp|desk lamp|marble base|swing-arm|vintage edison|cone shade|geometric metal/i.test(productName);

    const existingStr = existingItems.length
      ? existingItems.map(i => {
          const ps = 0.55 + (i.cy / canvasH) * 0.70;
          const fw = Math.round(canvasW * i.scale * ps);
          return `  - "${i.productName}" (${i.category}): center (${i.cx}, ${i.cy}), ~${fw}px wide`;
        }).join('\n')
      : '  none';

    const prompt = `You are an interior design AI. Look at the room photo carefully.

CANVAS: ${canvasW}×${canvasH}px
PERSPECTIVE: perspScale(y) = 0.55 + (y/${canvasH})×0.70  →  items lower in canvas appear larger/closer
FLOOR LINE: y≈${floorYpx}px (fraction ${floorLineY.toFixed(2)})
FLOOR AREA: feet of floor items sit between y=${floorYpx} and y=${Math.round(canvasH * 0.90)}

NEW ITEM: "${productName}" (${category}), real size: ${widthCm}cm wide × ${heightCm}cm tall

Step 1 — Estimate the room's real width from the photo perspective (typical room: 300–500 cm).
Step 2 — Compute rendered_width = (${widthCm} / estimatedRoomWidthCm) × ${canvasW}
Step 3 — Choose a placement depth (y position for the item's feet on the floor).
Step 4 — scale = rendered_width / (${canvasW} × perspScale(footY))

ALREADY ON CANVAS (maintain ≥ 50px gap):
${existingStr}

PLACEMENT RULES:
- ${isCeiling ? `Ceiling pendant: cy = 40–100 (hanging from ceiling, centered horizontally)` :
    isTableLamp ? `Table lamp: cy = 200–330 (sitting on surface, near wall or cabinet)` :
    `Floor item: feet touch floor, so cy = footY − (rendered_height/2); footY between ${floorYpx} and ${Math.round(canvasH * 0.88)}`}
- Sofas/cabinets: near back wall (footY close to ${floorYpx})
- Tables/chairs: open floor area (footY ${Math.round(floorYpx * 1.05)}–${Math.round(canvasH * 0.82)})
- Lamps: corners (cx near 50–120 or ${canvasW - 120}–${canvasW - 50})
- Do NOT overlap existing items bounding boxes above
- cx must be between 60 and ${canvasW - 60}

Return ONLY valid JSON (no markdown, no explanation):
{"cx":450,"cy":390,"scale":0.22,"estimatedRoomWidthCm":380,"reason":"one short sentence"}`;

    try {
      const { data, mimeType } = await toBase64(roomImageUrl);
      const raw   = await callVisionAI(data, mimeType, prompt, this.groqKey, this.openrouterKey, this.logger, 400);
      const clean = raw.replace(/```json|```/g, '').trim();
      const json  = JSON.parse(clean);

      const cx    = typeof json.cx    === 'number' ? clamp(Math.round(json.cx),    60, canvasW - 60) : DEFAULT.cx;
      const cy    = typeof json.cy    === 'number' ? clamp(Math.round(json.cy),    20, canvasH - 20) : DEFAULT.cy;
      const scale = typeof json.scale === 'number' ? clamp(json.scale, 0.04, 0.80) : DEFAULT.scale;

      return { cx, cy, scale, reason: typeof json.reason === 'string' ? json.reason : '' };
    } catch (err: any) {
      this.logger.warn(`placeItem AI failed: ${err?.message} — using default`);
      return DEFAULT;
    }
  }

  private defaultPlacement(
    category: string,
    count: number,
    floorLineY: number,
    widthCm: number,
    canvasW: number,
    canvasH: number,
  ): { cx: number; cy: number; scale: number; reason: string } {
    const floorY  = floorLineY * canvasH;
    const ps      = 0.55 + (floorY / canvasH) * 0.70;
    const ROOM_W  = 420;
    const fw      = Math.min((widthCm / ROOM_W) * canvasW / ps, 260);
    const scale   = fw / (canvasW * ps);
    const fh      = fw * 1.0; // approximate aspect 1:1
    const cy      = Math.round(floorY - fh / 2);
    const xSlots  = [0.30, 0.55, 0.20, 0.70, 0.42, 0.65];
    const cx      = Math.round(xSlots[count % xSlots.length] * canvasW);
    return { cx, cy: Math.max(20, cy), scale: Math.max(0.05, scale), reason: 'Fallback placement' };
  }

  // Kept for backward compatibility — unused
  async getProductBoundingBox(_imageUrl: string) { return null; }
  async suggestFurniturePlacement2d(_category: string, _roomImageUrl: string) { return null; }
}
