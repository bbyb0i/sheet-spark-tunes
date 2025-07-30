export interface TikTokSoundConfig {
  id: string;
  name: string;
  url: string;
  xpath: string;
}

export interface ScrapedSoundData {
  id: string;
  name: string;
  url: string;
  totalPosts: number;
  lastUpdated: string;
  scrapedAt: Date;
}

export interface HistoricalDataEntry {
  date: string;
  totalPosts: number;
  dailyGrowth: number;
}

export interface StoredSoundHistory {
  soundId: string;
  history: HistoricalDataEntry[];
  lastUpdated: string;
}

export interface ScrapeResult {
  success: boolean;
  data?: ScrapedSoundData[];
  error?: string;
  timestamp: Date;
}