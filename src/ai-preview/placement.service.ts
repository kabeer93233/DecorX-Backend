import { Injectable } from '@nestjs/common';
import { ROOMS } from './rooms-data';

export interface PlacementResult {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  reason: string;
  confidence: number;
  zoneId: string;
}

type ExistingItem = {
  category: string;
  position: [number, number, number];
  width?: number;
  depth?: number;
};

// 2-D AABB overlap on the floor plane
function boxesOverlap(
  ax: number, az: number, aw: number, ad: number,
  bx: number, bz: number, bw: number, bd: number,
): boolean {
  return (
    ax - aw / 2 < bx + bw / 2 &&
    ax + aw / 2 > bx - bw / 2 &&
    az - ad / 2 < bz + bd / 2 &&
    az + ad / 2 > bz - bd / 2
  );
}

// Real-world floor footprints (width × depth)
const CATEGORY_FOOTPRINT: Record<string, [number, number]> = {
  sofa:       [2.2,  0.95],
  loveseat:   [1.4,  0.9],
  chair:      [0.65, 0.65],
  table:      [1.2,  0.7],
  stool:      [0.45, 0.45],
  decoration: [0.4,  0.4],
  cabinet:    [1.0,  0.42],
};

@Injectable()
export class PlacementService {
  suggest(
    roomId: string,
    productCategory: string,
    productWidth: number,
    productDepth: number,
    existingItems: ExistingItem[] = [],
  ): PlacementResult {
    const room = (ROOMS as any[]).find((r: any) => r.id === roomId);
    if (!room) return this.defaultPlacement(productCategory, productWidth, productDepth);

    const category = productCategory.toLowerCase();
    const zones = (room.placementZones as any[])
      .filter((z: any) =>
        (z.allowedCategories as string[]).some((c) => c.toLowerCase() === category),
      )
      .sort((a: any, b: any) => b.priority - a.priority);

    if (zones.length === 0) {
      // No matching zone — do a room-wide grid search
      const pos = this.gridSearch(
        room.width, room.depth, productWidth, productDepth, existingItems,
      );
      if (pos) {
        return {
          position: [pos[0], 0, pos[1]],
          rotation: [0, 0, 0],
          scale: [productWidth, 1, productDepth],
          reason: `${productCategory} placed in the nearest available space.`,
          confidence: 0.5,
          zoneId: 'grid',
        };
      }
      return this.defaultPlacement(productCategory, productWidth, productDepth);
    }

    // Clearance margin so items don't touch
    const newW = productWidth + 0.25;
    const newD = productDepth + 0.25;

    for (const zone of zones) {
      const hasCollision = this.checkCollision(
        zone.centerX, zone.centerZ, newW, newD, existingItems,
      );
      if (!hasCollision) {
        return {
          position: [zone.centerX, 0, zone.centerZ],
          rotation: [0, zone.defaultRotationY ?? 0, 0],
          scale: [productWidth, 1, productDepth],
          reason: this.buildReason(category, zone.name),
          confidence: zone.priority / 10,
          zoneId: zone.id,
        };
      }
    }

    // All named zones occupied — grid-search the whole room floor
    const pos = this.gridSearch(
      room.width, room.depth, productWidth, productDepth, existingItems,
    );
    if (pos) {
      return {
        position: [pos[0], 0, pos[1]],
        rotation: [0, zones[0].defaultRotationY ?? 0, 0],
        scale: [productWidth, 1, productDepth],
        reason: `${productCategory} placed in available floor space — drag to adjust.`,
        confidence: 0.5,
        zoneId: 'grid',
      };
    }

    // Room completely full — stack slightly offset from centre
    return {
      position: [0.3, 0, 0.3],
      rotation: [0, 0, 0],
      scale: [productWidth, 1, productDepth],
      reason: 'Room is crowded — drag to a free spot.',
      confidence: 0.2,
      zoneId: 'overflow',
    };
  }

  private checkCollision(
    x: number, z: number, w: number, d: number,
    existingItems: ExistingItem[],
  ): boolean {
    return existingItems.some((item) => {
      const cat = item.category?.toLowerCase() ?? 'decoration';
      const [fw, fd] = CATEGORY_FOOTPRINT[cat] ?? [1.0, 1.0];
      const iw = (item.width ?? fw) + 0.15;
      const id = (item.depth ?? fd) + 0.15;
      return boxesOverlap(x, z, w, d, item.position[0], item.position[2], iw, id);
    });
  }

  // Scan the room floor in a grid to find the first clear position
  private gridSearch(
    roomWidth: number,
    roomDepth: number,
    productWidth: number,
    productDepth: number,
    existingItems: ExistingItem[],
  ): [number, number] | null {
    const STEP = 0.5;
    const margin = 0.15;
    const halfW = roomWidth  / 2 - productWidth  / 2 - margin;
    const halfD = roomDepth  / 2 - productDepth / 2 - margin;
    const newW = productWidth  + 0.25;
    const newD = productDepth + 0.25;

    for (let z = -halfD; z <= halfD; z += STEP) {
      for (let x = -halfW; x <= halfW; x += STEP) {
        if (!this.checkCollision(x, z, newW, newD, existingItems)) {
          return [
            Math.round(x * 10) / 10,
            Math.round(z * 10) / 10,
          ];
        }
      }
    }
    return null;
  }

  private buildReason(category: string, zoneName: string): string {
    const map: Record<string, string> = {
      sofa:       `Sofa placed at the ${zoneName} — optimal wall positioning.`,
      table:      `Table at the ${zoneName} — centred between seating.`,
      chair:      `Chair placed at the ${zoneName} — complements existing pieces.`,
      stool:      `Stool at the ${zoneName} — flexible accent piece.`,
      cabinet:    `Cabinet at the ${zoneName} — makes good use of wall space.`,
      decoration: `Décor placed at the ${zoneName} — adds a visual accent.`,
    };
    return map[category] ?? `${category} placed at the ${zoneName}.`;
  }

  private defaultPlacement(
    category: string, w: number, d: number,
  ): PlacementResult {
    return {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [w, 1, d],
      reason: `${category} placed at centre — drag to reposition.`,
      confidence: 0.2,
      zoneId: 'default',
    };
  }
}
