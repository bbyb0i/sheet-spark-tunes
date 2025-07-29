import { Artist, TikTokSound, ChartDataPoint } from '@/types/tiktok';

// Generate realistic chart data for the last 14 days
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

export const mockData: Record<'zukenee' | 'bnyx', Artist> = {
  zukenee: {
    id: 'zukenee',
    name: 'Zukenee',
    totalSpikes: 0,
    sounds: [
      createSound('z1', 'Midnight Drive', 'Zukenee', 45000, 120),
      createSound('z2', 'Neon Dreams', 'Zukenee', 32000, 85),
      createSound('z3', 'City Lights', 'Zukenee', 28000, 95),
      createSound('z4', 'Electric Pulse', 'Zukenee', 51000, 140),
      createSound('z5', 'Digital Love', 'Zukenee', 19000, 65),
      createSound('z6', 'Synthwave Nights', 'Zukenee', 37000, 110),
    ]
  },
  bnyx: {
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
  }
};

// Calculate total spikes for each artist
mockData.zukenee.totalSpikes = mockData.zukenee.sounds.reduce((count, sound) => {
  return count + sound.chartData.filter(point => point.isSpike).length;
}, 0);

mockData.bnyx.totalSpikes = mockData.bnyx.sounds.reduce((count, sound) => {
  return count + sound.chartData.filter(point => point.isSpike).length;
}, 0);