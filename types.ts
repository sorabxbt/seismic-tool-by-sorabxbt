export interface LayerItem {
    id: string;
    img: HTMLImageElement;
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
    opacity: number;
    maskCanvas?: HTMLCanvasElement; // The alpha mask for eraser
}

export interface StickerPack {
    name: string;
    thumbnail: string;
    stickers: string[];
}