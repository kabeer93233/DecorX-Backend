export const ROOMS = [
  {
    id: 'living-room-01',
    type: 'living_room',
    width: 6, depth: 5, height: 3,
    placementZones: [
      // Back wall — main sofa
      {
        id: 'sofa-back', name: 'Back Wall Sofa',
        allowedCategories: ['sofa', 'loveseat', 'cabinet', 'decoration'],
        centerX: 0, centerZ: -1.8,
        defaultRotationY: 0, priority: 10, wallAligned: true,
      },
      // Left wall — accent sofa / loveseat
      {
        id: 'sofa-left', name: 'Left Wall Sofa',
        allowedCategories: ['sofa', 'loveseat', 'chair'],
        centerX: -2.2, centerZ: 0,
        defaultRotationY: Math.PI / 2, priority: 9, wallAligned: true,
      },
      // Center — coffee table
      {
        id: 'center-table', name: 'Center Coffee Table',
        allowedCategories: ['table', 'stool'],
        centerX: 0, centerZ: 0,
        defaultRotationY: 0, priority: 8, wallAligned: false,
      },
      // Left corner
      {
        id: 'left-corner', name: 'Left Corner',
        allowedCategories: ['decoration', 'chair', 'stool'],
        centerX: -2.1, centerZ: -1.8,
        defaultRotationY: 0.785, priority: 7, wallAligned: false,
      },
      // Right corner
      {
        id: 'right-corner', name: 'Right Corner',
        allowedCategories: ['decoration', 'chair', 'stool'],
        centerX: 2.1, centerZ: -1.8,
        defaultRotationY: -0.785, priority: 6, wallAligned: false,
      },
      // Right wall — cabinet / chair
      {
        id: 'right-wall', name: 'Right Wall',
        allowedCategories: ['cabinet', 'chair', 'decoration'],
        centerX: 2.3, centerZ: 0,
        defaultRotationY: -Math.PI / 2, priority: 5, wallAligned: true,
      },
      // Front area chairs (facing back)
      {
        id: 'front-left', name: 'Front Left Chair',
        allowedCategories: ['chair', 'stool'],
        centerX: -1.0, centerZ: 1.2,
        defaultRotationY: Math.PI, priority: 4, wallAligned: false,
      },
      {
        id: 'front-right', name: 'Front Right Chair',
        allowedCategories: ['chair', 'stool'],
        centerX: 1.0, centerZ: 1.2,
        defaultRotationY: Math.PI, priority: 3, wallAligned: false,
      },
    ],
  },
  {
    id: 'bedroom-01',
    type: 'bedroom',
    width: 5, depth: 4.5, height: 2.8,
    placementZones: [
      {
        id: 'bed-wall', name: 'Bed Area',
        allowedCategories: ['sofa', 'cabinet', 'table', 'decoration'],
        centerX: 0, centerZ: -1.5,
        defaultRotationY: 0, priority: 10, wallAligned: true,
      },
      {
        id: 'left-side', name: 'Left Nightstand',
        allowedCategories: ['table', 'stool', 'decoration'],
        centerX: -1.6, centerZ: -1.2,
        defaultRotationY: 0, priority: 9, wallAligned: false,
      },
      {
        id: 'right-side', name: 'Right Nightstand',
        allowedCategories: ['table', 'stool', 'decoration'],
        centerX: 1.6, centerZ: -1.2,
        defaultRotationY: 0, priority: 8, wallAligned: false,
      },
      {
        id: 'wardrobe-wall', name: 'Wardrobe Wall',
        allowedCategories: ['cabinet', 'sofa', 'chair'],
        centerX: -2.0, centerZ: 0.5,
        defaultRotationY: Math.PI / 2, priority: 7, wallAligned: true,
      },
      {
        id: 'reading-corner', name: 'Reading Corner',
        allowedCategories: ['chair', 'stool', 'decoration'],
        centerX: 1.8, centerZ: 0.8,
        defaultRotationY: -0.5, priority: 6, wallAligned: false,
      },
    ],
  },
  {
    id: 'dining-room-01',
    type: 'dining_room',
    width: 5, depth: 4, height: 2.8,
    placementZones: [
      {
        id: 'dining-center', name: 'Dining Table',
        allowedCategories: ['table'],
        centerX: 0, centerZ: 0,
        defaultRotationY: 0, priority: 10, wallAligned: false,
      },
      {
        id: 'chair-left-1', name: 'Chair Left 1',
        allowedCategories: ['chair', 'stool'],
        centerX: -1.3, centerZ: -0.3,
        defaultRotationY: Math.PI / 2, priority: 9, wallAligned: false,
      },
      {
        id: 'chair-right-1', name: 'Chair Right 1',
        allowedCategories: ['chair', 'stool'],
        centerX: 1.3, centerZ: -0.3,
        defaultRotationY: -Math.PI / 2, priority: 8, wallAligned: false,
      },
      {
        id: 'chair-left-2', name: 'Chair Left 2',
        allowedCategories: ['chair', 'stool'],
        centerX: -1.3, centerZ: 0.5,
        defaultRotationY: Math.PI / 2, priority: 7, wallAligned: false,
      },
      {
        id: 'chair-right-2', name: 'Chair Right 2',
        allowedCategories: ['chair', 'stool'],
        centerX: 1.3, centerZ: 0.5,
        defaultRotationY: -Math.PI / 2, priority: 6, wallAligned: false,
      },
      {
        id: 'buffet-wall', name: 'Buffet Cabinet',
        allowedCategories: ['cabinet', 'decoration'],
        centerX: 0, centerZ: -1.5,
        defaultRotationY: 0, priority: 5, wallAligned: true,
      },
      {
        id: 'head-chair', name: 'Head of Table',
        allowedCategories: ['chair'],
        centerX: 0, centerZ: -1.0,
        defaultRotationY: 0, priority: 4, wallAligned: false,
      },
      {
        id: 'foot-chair', name: 'Foot of Table',
        allowedCategories: ['chair'],
        centerX: 0, centerZ: 0.9,
        defaultRotationY: Math.PI, priority: 3, wallAligned: false,
      },
    ],
  },
];
