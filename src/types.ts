export type Category = 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories';

export interface ClothingItem {
  id: string;
  image: string;
  category: Category;
  tags: string[];
  color?: string;
  style?: string;
  size?: string;
  brand?: string;
  material?: string;
  comments?: string;
  createdAt: number;
}

export interface OutfitItem {
  itemId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

export interface Outfit {
  id: string;
  name: string;
  items: OutfitItem[];
  previewImage: string; // Snapshot of the canvas
  tags: string[];
  createdAt: number;
}
