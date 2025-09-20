export interface Layout {
  id: string;
  name: string;
  type: LayoutType;
  grid: GridConfiguration;
  streams: LayoutStream[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum LayoutType {
  PRESET = 'preset',
  CUSTOM = 'custom'
}

export interface GridConfiguration {
  rows: number;
  columns: number;
  gaps: number;
  aspectRatio: AspectRatio;
  customTiles?: CustomTile[];
}

export interface CustomTile {
  position: number;
  rowSpan: number;
  colSpan: number;
}

export interface LayoutStream {
  position: number;
  streamId: string;
  customSize?: {
    rowSpan: number;
    colSpan: number;
  };
}

export enum AspectRatio {
  ORIGINAL = 'original',
  SIXTEEN_NINE = '16:9',
  FOUR_THREE = '4:3',
  SQUARE = '1:1',
  CUSTOM = 'custom'
}

export const PRESET_LAYOUTS: Record<string, GridConfiguration> = {
  '1x1': { rows: 1, columns: 1, gaps: 0, aspectRatio: AspectRatio.SIXTEEN_NINE },
  '2x1': { rows: 1, columns: 2, gaps: 4, aspectRatio: AspectRatio.SIXTEEN_NINE },
  '3x1': { rows: 1, columns: 3, gaps: 4, aspectRatio: AspectRatio.SIXTEEN_NINE },
  '2x2': { rows: 2, columns: 2, gaps: 4, aspectRatio: AspectRatio.SIXTEEN_NINE },
  '3x3': { rows: 3, columns: 3, gaps: 4, aspectRatio: AspectRatio.SIXTEEN_NINE },
  '4x4': { rows: 4, columns: 4, gaps: 4, aspectRatio: AspectRatio.SIXTEEN_NINE }
};