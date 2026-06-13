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

  // ── Whole-room redesign: AI arranges ALL items like an expert designer ────────

  async redesignRoom(
    roomImageUrl: string,
    floorLineY: number,
    items: Array<{ id: string; productName: string; category: string; widthCm: number; heightCm: number }>,
    canvasW = 900,
    canvasH = 600,
  ): Promise<{ placements: Array<{ id: string; cx_pct: number; foot_y_pct: number }>; designTheme: string }> {
    const FALLBACK = { placements: [] as Array<{ id: string; cx_pct: number; foot_y_pct: number }>, designTheme: '' };
    if (!this.groqKey && !this.openrouterKey) return FALLBACK;
    if (!items.length) return FALLBACK;

    // Give AI concrete reference points derived from the actual detected floor line
    const fl       = clamp(floorLineY, 0.42, 0.85);
    const midFY    = +(fl + 0.14).toFixed(2);
    const fgFY     = 0.87;
    const surfFY   = +(fl - 0.10).toFixed(2);

    const itemList = items
      .map(i => `  • id="${i.id}"  name="${i.productName}"  category=${i.category}  real_size=${i.widthCm}cm wide × ${i.heightCm}cm tall`)
      .join('\n');

    const prompt = `You are a world-class interior designer. Arrange furniture in this room photo like an expert.

LOOK AT THE PHOTO carefully — notice where the floor is, where the walls are, and how perspective works.

CANVAS SIZE: ${canvasW}×${canvasH} pixels. Coordinates as fractions 0.0→1.0.
FLOOR LINE: The back wall meets the floor at approximately y_pct = ${fl.toFixed(2)} in this image.

PERSPECTIVE REFERENCE — where each furniture type's FEET/BASE should sit (y_pct):
  • Sofas, cabinets, bookshelves (against back/side wall): foot_y_pct ≈ ${fl.toFixed(2)}
  • Floor lamps (beside sofa at back wall):                foot_y_pct ≈ ${fl.toFixed(2)}
  • Coffee tables, rugs (mid-floor between camera & sofa): foot_y_pct ≈ ${midFY}
  • Chairs, stools (open floor):                           foot_y_pct ≈ ${midFY}
  • Accent chairs, ottomans (closer to camera):            foot_y_pct ≈ ${fgFY}
  • Table lamps (on side table beside sofa):               foot_y_pct ≈ ${surfFY}
  • Pendant/chandelier (ceiling):                          foot_y_pct ≈ 0.03

ITEMS TO PLACE:
${itemList}

FOR EACH ITEM return:
  • cx_pct   — horizontal center as fraction of width (0.05 left edge → 0.95 right edge)
  • foot_y_pct — where the item's base/feet sit, as fraction of height (see reference above)

INTERIOR DESIGN RULES:
1. SEATING GROUP: Arrange sofas facing each other or a focal wall — create a U or L shape.
2. COFFEE TABLE: Center between sofas (same cx_pct as midpoint of sofas), foot_y_pct ≈ ${midFY}.
3. FLOOR LAMPS: In corners or at sofa ends — cx_pct near 0.08 or 0.88.
4. TABLE LAMPS: Beside seating on side table — cx_pct near sofa end.
5. PENDANTS: Centered above seating area (cx_pct ≈ 0.45–0.55), foot_y_pct ≈ 0.03.
6. CABINETS: Against left or right wall — cx_pct near 0.07 or 0.88.
7. RUG: Centered under seating group.
8. BALANCE: Spread items across the room. Never cluster everything in the center.
9. TRAFFIC FLOW: Leave walkable space — items should not block paths.
10. SECOND SOFA: Perpendicular or parallel to first, forming a complete seating arrangement.

Return ONLY valid JSON — no markdown, no extra text:
{
  "placements": [
    {"id": "EXACT_ITEM_ID_FROM_LIST", "cx_pct": 0.25, "foot_y_pct": ${fl.toFixed(2)}},
    ...one entry per item, ALL items must be included...
  ],
  "designTheme": "One sentence describing this arrangement"
}`;

    try {
      const { data, mimeType } = await toBase64(roomImageUrl);
      const raw   = await callVisionAI(data, mimeType, prompt, this.groqKey, this.openrouterKey, this.logger, 700);
      const clean = raw.replace(/```json|```/g, '').trim();
      const json  = JSON.parse(clean);

      if (!Array.isArray(json.placements)) return FALLBACK;

      const placements = json.placements
        .filter((p: any) => typeof p.id === 'string' && isNum(p.cx_pct) && isNum(p.foot_y_pct))
        .map((p: any) => ({
          id:         p.id,
          cx_pct:     clamp(+p.cx_pct,     0.05, 0.95),
          foot_y_pct: clamp(+p.foot_y_pct, 0.01, 0.96),
        }));

      return {
        placements,
        designTheme: typeof json.designTheme === 'string' ? json.designTheme : '',
      };
    } catch (err: any) {
      this.logger.warn(`redesignRoom failed: ${err?.message}`);
      return FALLBACK;
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
FLOOR LINE: y≈${floorYpx}px — this is where the back wall meets the floor.
Items higher in canvas (smaller y) are farther from camera. Items lower (larger y) are closer.

NEW ITEM TO PLACE: "${productName}" (${category}), real dimensions: ${widthCm}cm wide × ${heightCm}cm tall

ALREADY ON CANVAS — avoid overlapping these (each entry: name, center x, center y, approx pixel width):
${existingStr}

YOUR TASK: Choose the best (cx, cy) position for the new item.
cx = horizontal center in pixels (0–${canvasW})
cy = vertical center in pixels (0–${canvasH})

PLACEMENT RULES:
${isCeiling
  ? `- This is a CEILING lamp. It hangs from the ceiling, so cy must be between 30 and 120.
- Place it above the seating area (roughly center-horizontal unless one is already there).`
  : isTableLamp
  ? `- This is a TABLE lamp. It sits on a surface. cy should be between 180 and 320.
- Place near a wall, corner, or next to seating.`
  : `- This is a FLOOR item. Its feet sit on the floor.
- For items NEAR the back wall (sofa, cabinet, bookcase): cy ≈ ${Math.round(floorYpx * 0.85)}–${floorYpx}
- For items in the MID-FLOOR area (table, chair, stool, rug): cy ≈ ${floorYpx}–${Math.round(canvasH * 0.80)}
- For items in the FOREGROUND (closer to camera): cy ≈ ${Math.round(canvasH * 0.78)}–${Math.round(canvasH * 0.88)}`}
- Sofas/cabinets/bookshelves: place against the back wall or side walls
- Lamps (floor): place in corners or beside seating (cx near 60–160 or ${canvasW - 160}–${canvasW - 60})
- Tables: open floor area, not behind other items
- Do NOT place on top of existing items. Keep at least 60px gap from each existing item's center.
- cx must be between 60 and ${canvasW - 60}

Return ONLY valid JSON, no markdown:
{"cx":450,"cy":390,"reason":"one short sentence explaining placement"}`;

    try {
      const { data, mimeType } = await toBase64(roomImageUrl);
      const raw   = await callVisionAI(data, mimeType, prompt, this.groqKey, this.openrouterKey, this.logger, 400);
      const clean = raw.replace(/```json|```/g, '').trim();
      const json  = JSON.parse(clean);

      const cx = typeof json.cx === 'number' ? clamp(Math.round(json.cx), 60, canvasW - 60) : DEFAULT.cx;
      const cy = typeof json.cy === 'number' ? clamp(Math.round(json.cy), 20, canvasH - 20) : DEFAULT.cy;

      return { cx, cy, scale: DEFAULT.scale, reason: typeof json.reason === 'string' ? json.reason : '' };
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
