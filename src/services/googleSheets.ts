import { GoogleSheetsData, DailyLogEntry, GoogleSheetsSound, ProcessedSoundData } from '@/types/googleSheets';
import { ChartDataPoint } from '@/types/tiktok';

// Google Sheets configuration
const SHEET_ID = '1jhaGQjnxoBUOQvmvzRiAF2D5zr0KNKFOolol50l7Vsk';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?`;

// Tab/Sheet GIDs (you'll need to get these from the actual sheet URLs)
const SHEET_GIDS = {
  dailyLog: '0', // Tab 1 - Daily Log
  overview: '1122838640', // Tab 2 - General Overview  
  performanceRanking: '3', // Tab 4 - Song Performance Ranking
};

/**
 * Fetch data from a specific Google Sheet tab
 */
async function fetchSheetData(gid: string): Promise<any[]> {
  try {
    const url = `${BASE_URL}tqx=out:json&gid=${gid}`;
    const response = await fetch(url);
    const text = await response.text();
    
    // Parse the Google Sheets JSON response (it's wrapped in a function call)
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;
    
    return rows.map((row: any) => 
      row.c ? row.c.map((cell: any) => cell ? cell.v : null) : []
    );
  } catch (error) {
    console.error(`Error fetching sheet data for GID ${gid}:`, error);
    return [];
  }
}

/**
 * Parse daily log data from Tab 1
 */
function parseDailyLog(rawData: any[]): DailyLogEntry[] {
  if (!rawData || rawData.length < 2) return [];
  
  const headers = rawData[0];
  const dateColumns = headers.slice(1); // Assuming first column is sound name, rest are dates
  
  const dailyLog: DailyLogEntry[] = [];
  
  // Skip header row
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    const soundName = row[0];
    
    if (!soundName) continue;
    
    // Process each date column
    for (let j = 1; j < row.length && j - 1 < dateColumns.length; j++) {
      const posts = parseInt(row[j]) || 0;
      const date = dateColumns[j - 1];
      
      if (date && posts > 0) {
        dailyLog.push({
          date: formatDate(date),
          soundName: soundName.toString(),
          dailyPosts: posts
        });
      }
    }
  }
  
  return dailyLog;
}

/**
 * Parse sounds overview from Tab 2
 */
function parseSoundsOverview(rawData: any[]): GoogleSheetsSound[] {
  if (!rawData || rawData.length < 2) return [];
  
  const sounds: GoogleSheetsSound[] = [];
  
  // Skip header row
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0]) continue; // Skip empty rows
    
    sounds.push({
      soundName: row[0]?.toString() || '',
      soundLink: row[1]?.toString() || '',
      livePosts: parseInt(row[2]) || 0,
    });
  }
  
  return sounds;
}

/**
 * Parse performance ranking from Tab 4
 */
function parsePerformanceRanking(rawData: any[]): GoogleSheetsSound[] {
  if (!rawData || rawData.length < 2) return [];
  
  const ranking: GoogleSheetsSound[] = [];
  
  // Skip header row
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row[0]) continue;
    
    ranking.push({
      soundName: row[0]?.toString() || '',
      livePosts: parseInt(row[1]) || 0,
      performanceRank: i, // Row position as rank
    });
  }
  
  return ranking;
}

/**
 * Format date to YYYY-MM-DD format
 */
function formatDate(dateValue: any): string {
  if (!dateValue) return new Date().toISOString().split('T')[0];
  
  // Handle different date formats from Google Sheets
  if (typeof dateValue === 'string') {
    return new Date(dateValue).toISOString().split('T')[0];
  }
  
  if (typeof dateValue === 'number') {
    // Google Sheets date serial number
    const date = new Date((dateValue - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  return new Date().toISOString().split('T')[0];
}

/**
 * Process and combine all sheet data into usable format
 */
function processSheetData(sheetsData: GoogleSheetsData): ProcessedSoundData[] {
  const { dailyLog, soundsOverview, performanceRanking } = sheetsData;
  
  // Group daily log by sound name
  const soundGroups = dailyLog.reduce((acc, entry) => {
    if (!acc[entry.soundName]) {
      acc[entry.soundName] = [];
    }
    acc[entry.soundName].push(entry);
    return acc;
  }, {} as Record<string, DailyLogEntry[]>);
  
  const processedSounds: ProcessedSoundData[] = [];
  
  Object.entries(soundGroups).forEach(([soundName, entries]) => {
    // Sort entries by date
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Find corresponding overview and ranking data
    const overviewData = soundsOverview.find(s => s.soundName === soundName);
    const rankingData = performanceRanking.find(s => s.soundName === soundName);
    
    // Create chart data
    const chartData: ChartDataPoint[] = entries.map(entry => ({
      date: entry.date,
      dailyPosts: entry.dailyPosts,
      isSpike: entry.dailyPosts > 100 // Spike detection logic
    }));
    
    // Calculate metrics
    const totalPosts = overviewData?.livePosts || entries.reduce((sum, e) => sum + e.dailyPosts, 0);
    const dailyGrowth = entries.length > 0 ? entries[entries.length - 1].dailyPosts : 0;
    const isSpike = dailyGrowth > 100;
    
    processedSounds.push({
      id: soundName.toLowerCase().replace(/\s+/g, '-'),
      name: soundName,
      artist: 'Zukenee', // Default artist
      totalPosts,
      dailyGrowth,
      isSpike,
      lastUpdated: new Date().toISOString(),
      chartData,
      soundLink: overviewData?.soundLink,
      performanceRank: rankingData?.performanceRank
    });
  });
  
  return processedSounds.sort((a, b) => (b.performanceRank || 999) - (a.performanceRank || 999));
}

/**
 * Main function to fetch and process all Google Sheets data
 */
export async function fetchZukeneeData(): Promise<ProcessedSoundData[]> {
  try {
    console.log('Fetching Zukenee data from Google Sheets...');
    
    // Fetch all sheet tabs in parallel
    const [dailyLogRaw, overviewRaw, rankingRaw] = await Promise.all([
      fetchSheetData(SHEET_GIDS.dailyLog),
      fetchSheetData(SHEET_GIDS.overview),
      fetchSheetData(SHEET_GIDS.performanceRanking),
    ]);
    
    // Parse the raw data
    const sheetsData: GoogleSheetsData = {
      dailyLog: parseDailyLog(dailyLogRaw),
      soundsOverview: parseSoundsOverview(overviewRaw),
      performanceRanking: parsePerformanceRanking(rankingRaw),
    };
    
    console.log('Parsed sheets data:', {
      dailyLogEntries: sheetsData.dailyLog.length,
      soundsCount: sheetsData.soundsOverview.length,
      rankingCount: sheetsData.performanceRanking.length
    });
    
    // Process and return the data
    return processSheetData(sheetsData);
    
  } catch (error) {
    console.error('Error fetching Zukenee data:', error);
    return [];
  }
}

/**
 * Refresh data periodically (call this in your app)
 */
export async function refreshZukeneeData(): Promise<ProcessedSoundData[]> {
  return fetchZukeneeData();
}