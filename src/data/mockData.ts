import { Artist, TikTokSound, ChartDataPoint } from '@/types/tiktok';
import { ProcessedSoundData } from '@/types/googleSheets';

// Convert Google Sheets data to TikTok sound format
export function convertGoogleSheetsToTikTokSound(sheetsData: ProcessedSoundData[]): TikTokSound[] {
  return sheetsData.map(sound => ({
    id: sound.id,
    name: sound.name,
    artist: sound.artist,
    totalPosts: sound.totalPosts,
    dailyGrowth: sound.dailyGrowth,
    isSpike: sound.isSpike,
    lastUpdated: sound.lastUpdated,
    chartData: sound.chartData
  }));
}

// Generate realistic chart data for the last 14 days (fallback for BNYX)
const generateChartData = (baseValue: number, volatility: number = 50): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const today = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Create some variance with occasional spikes
    const randomFactor = Math.random();
    let dailyPosts = baseValue + (Math.random() - 0.5) * volatility;
    
    // 15% chance of a spike
    if (randomFactor > 0.85) {
      dailyPosts += Math.random() * 200 + 100; // Spike of 100-300
    }
    
    dailyPosts = Math.max(0, Math.round(dailyPosts));
    const isSpike = dailyPosts > baseValue + 100;
    
    data.push({
      date: date.toISOString().split('T')[0],
      dailyPosts,
      isSpike
    });
  }
  
  return data;
};

const createSound = (
  id: string,
  name: string,
  artist: string,
  baseTotal: number,
  baseDailyGrowth: number
): TikTokSound => {
  const chartData = generateChartData(baseDailyGrowth, 30);
  const todayGrowth = chartData[chartData.length - 1].dailyPosts;
  const isSpike = todayGrowth > baseDailyGrowth + 100;
  
  return {
    id,
    name,
    artist,
    totalPosts: baseTotal + chartData.reduce((sum, point) => sum + point.dailyPosts, 0),
    dailyGrowth: todayGrowth,
    isSpike,
    lastUpdated: new Date().toISOString(),
    chartData
  };
};

// Fallback mock data for BNYX (until we have their Google Sheets)
export const bnyxMockData: Artist = {
  id: 'bnyx',
  name: 'BNYX',
  totalSpikes: 0,
  sounds: [
    createSound('b1', 'Bass Drop', 'BNYX', 67000, 180),
    createSound('b2', 'Trap Melody', 'BNYX', 41000, 125),
    createSound('b3', 'Heavy Beat', 'BNYX', 55000, 160),
    createSound('b4', 'Dark Mode', 'BNYX', 29000, 90),
    createSound('b5', 'Future Bounce', 'BNYX', 48000, 135),
    createSound('b6', 'Club Anthem', 'BNYX', 73000, 220),
    createSound('b7', 'Underground', 'BNYX', 22000, 75),
  ]
};

// Calculate total spikes for BNYX
bnyxMockData.totalSpikes = bnyxMockData.sounds.reduce((count, sound) => {
  return count + sound.chartData.filter(point => point.isSpike).length;
}, 0);

// Create Zukenee artist data (will be populated from Google Sheets)
export function createZukeneeArtist(zukeneeData: TikTokSound[]): Artist {
  const totalSpikes = zukeneeData.reduce((count, sound) => {
    return count + sound.chartData.filter(point => point.isSpike).length;
  }, 0);

  return {
    id: 'zukenee',
    name: 'Zukenee',
    totalSpikes,
    sounds: zukeneeData
  };
}

// Export combined mock data for compatibility
export const mockData: Record<'zukenee' | 'bnyx', Artist> = {
  zukenee: {
    id: 'zukenee',
    name: 'Zukenee',
    totalSpikes: 0,
    sounds: [] // Will be populated from Google Sheets
  },
  bnyx: bnyxMockData
};