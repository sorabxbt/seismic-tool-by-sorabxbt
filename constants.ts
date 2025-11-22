import { StickerPack } from './types';

// Helper to create SVG stickers on the fly for a nice visual without external assets
const createSvgSticker = (shape: 'circle' | 'rect' | 'star', color: string, text: string) => {
  const svgContent = shape === 'circle' 
    ? `<circle cx="100" cy="100" r="90" fill="${color}" stroke="white" stroke-width="8"/>`
    : shape === 'star'
    ? `<polygon points="100,10 40,198 190,78 10,78 160,198" fill="${color}" stroke="white" stroke-width="8" />`
    : `<rect x="20" y="40" width="160" height="120" rx="20" fill="${color}" stroke="white" stroke-width="8"/>`;

  const svg = `
  <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
      </filter>
    </defs>
    <g filter="url(#shadow)">
      ${svgContent}
      <text x="50%" y="50%" dy=".3em" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="white" style="text-shadow:0 2px 4px rgba(0,0,0,0.5)">${text}</text>
    </g>
  </svg>`.trim();
  
  // Fix for unicode characters (emojis) in btoa
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
};

export const PACKS_DATA: StickerPack[] = [
    {
        name: 'Seismic Goggles',
        thumbnail: createSvgSticker('rect', '#60A5FA', '👓'),
        stickers: [
            createSvgSticker('rect', '#3B82F6', 'Blue Goggles'),
            createSvgSticker('rect', '#EC4899', 'Pink Goggles'),
            createSvgSticker('rect', '#10B981', 'Green Goggles'),
            createSvgSticker('rect', '#F59E0B', 'Gold Goggles'),
        ]
    },
    {
        name: 'Seismic Shapes',
        thumbnail: createSvgSticker('circle', '#34D399', '🔵'),
        stickers: [
            createSvgSticker('circle', '#EF4444', 'Red Dot'),
            createSvgSticker('circle', '#8B5CF6', 'Purple Orb'),
            createSvgSticker('star', '#FCD34D', 'Gold Star'),
            createSvgSticker('star', '#6366F1', 'Indigo Star'),
        ]
    },
    {
        name: 'Badges',
        thumbnail: createSvgSticker('star', '#F472B6', '★'),
        stickers: [
            createSvgSticker('rect', '#000000', 'V.I.P'),
            createSvgSticker('circle', '#64748B', 'Verified'),
            createSvgSticker('star', '#F59E0B', 'Winner'),
        ]
    }
];

export const SLIDER_IMAGES = [
    'https://picsum.photos/id/1011/600/600',
    'https://picsum.photos/id/1027/600/600',
    'https://picsum.photos/id/1062/600/600',
    'https://picsum.photos/id/1074/600/600',
    'https://picsum.photos/id/129/600/600',
    'https://picsum.photos/id/177/600/600',
    'https://picsum.photos/id/203/600/600',
];