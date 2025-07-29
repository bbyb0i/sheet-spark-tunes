export interface TikTokSound {
  id: string;
  name: string;
  artist: string;
  totalPosts: number;
  dailyGrowth: number;
  isSpike: boolean;
  lastUpdated: string;
  chartData: ChartDataPoint[];
}

export interface ChartDataPoint {
  date: string;
  dailyPosts: number;
  isSpike: boolean;
}

export interface Artist {
  id: string;
  name: string;
  sounds: TikTokSound[];
  totalSpikes: number;
}

export type ArtistType = 'zukenee' | 'bnyx';