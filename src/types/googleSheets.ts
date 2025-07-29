export interface GoogleSheetsSound {
  soundName: string;
  soundLink?: string;
  livePosts: number;
  performanceRank?: number;
}

export interface DailyLogEntry {
  date: string;
  soundName: string;
  dailyPosts: number;
}

export interface GoogleSheetsData {
  dailyLog: DailyLogEntry[];
  soundsOverview: GoogleSheetsSound[];
  performanceRanking: GoogleSheetsSound[];
}

export interface ProcessedSoundData {
  id: string;
  name: string;
  artist: string;
  totalPosts: number;
  dailyGrowth: number;
  isSpike: boolean;
  lastUpdated: string;
  chartData: ChartDataPoint[];
  soundLink?: string;
  performanceRank?: number;
}

export interface ChartDataPoint {
  date: string;
  dailyPosts: number;
  isSpike: boolean;
}