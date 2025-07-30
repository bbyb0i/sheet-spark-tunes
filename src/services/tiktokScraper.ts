import { TikTokSoundConfig, ScrapedSoundData, HistoricalDataEntry, StoredSoundHistory, ScrapeResult } from '@/types/tiktokScraper';
import { ProcessedSoundData } from '@/types/googleSheets';

// Zukenee sound configurations
const ZUKENEE_SOUNDS: TikTokSoundConfig[] = [
  {
    id: 'bromance',
    name: 'Bromance',
    url: 'https://www.tiktok.com/music/BROMANCE-7493377885936666641',
    xpath: '/html/body/div[1]/div[2]/div[2]/div/div/div[1]/div[2]/h2/h2/strong'
  },
  {
    id: 'spontaneous-slay',
    name: 'Spontaneous Slay',
    url: 'https://www.tiktok.com/music/SPONTANEOUS-SLAY-7493377885936633873',
    xpath: '/html/body/div[1]/div[2]/div[2]/div/div/div[1]/div[2]/h2/h2/strong'
  },
  {
    id: 'hindu',
    name: 'Hindu',
    url: 'https://www.tiktok.com/music/HINDU-7493377885936568337',
    xpath: '/html/body/div[1]/div[2]/div[2]/div/div/div[1]/div[2]/h2/h2/strong'
  },
  {
    id: 'stoopid-fool',
    name: 'Stoopid Fool',
    url: 'https://www.tiktok.com/music/STOOPID-FOOL-7493377885936486417',
    xpath: '/html/body/div[1]/div[2]/div[2]/div/div/div[1]/div[2]/h2/h2/strong'
  },
  {
    id: 'bromance-2',
    name: 'Bromance 2',
    url: 'https://www.tiktok.com/music/original-sound-7499599128733944622',
    xpath: '/html/body/div[1]/div[2]/div[2]/div/div/div[1]/div[2]/h2/h2/strong'
  }
];

const STORAGE_KEY = 'tiktok_sound_history';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

class TikTokScraperService {
  private async fetchWithCORS(url: string): Promise<string> {
    const proxies = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://thingproxy.freeboard.io/fetch/'
    ];

    for (const proxy of proxies) {
      try {
        console.log(`Trying to fetch ${url} via ${proxy}`);
        const proxyUrl = proxy + encodeURIComponent(url);
        const response = await fetch(proxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        
        if (response.ok) {
          const html = await response.text();
          console.log(`Successfully fetched HTML (${html.length} chars) via ${proxy}`);
          return html;
        }
      } catch (error) {
        console.log(`Proxy ${proxy} failed:`, error);
        continue;
      }
    }
    
    throw new Error(`All CORS proxies failed for ${url}`);
  }

  private extractPostCount(html: string, xpath: string): number {
    try {
      console.log(`Parsing HTML to extract post count...`);
      
      // Parse HTML using DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Multiple strategies to find the post count
      const strategies = [
        // Strategy 1: Look for the specific structure h2 > h2 > strong
        () => {
          const elements = doc.querySelectorAll('h2 h2 strong, h2 > h2 > strong');
          for (const element of elements) {
            const text = element.textContent || '';
            const match = text.match(/[\d,]+/);
            if (match) {
              console.log(`Found post count via h2>h2>strong: ${text}`);
              return parseInt(match[0].replace(/,/g, ''));
            }
          }
          return 0;
        },

        // Strategy 2: Look for data attributes commonly used by TikTok
        () => {
          const selectors = [
            '[data-e2e="music-post-count"]',
            '[data-e2e="sound-post-count"]',
            '[data-testid="music-post-count"]'
          ];
          
          for (const selector of selectors) {
            const element = doc.querySelector(selector);
            if (element) {
              const text = element.textContent || '';
              const match = text.match(/[\d,]+/);
              if (match) {
                console.log(`Found post count via data attribute: ${text}`);
                return parseInt(match[0].replace(/,/g, ''));
              }
            }
          }
          return 0;
        },

        // Strategy 3: Look for strong tags with numbers
        () => {
          const strongElements = doc.querySelectorAll('strong');
          for (const element of strongElements) {
            const text = element.textContent || '';
            // Look for patterns like "1.2K posts", "5,432 videos", etc.
            const patterns = [
              /^([\d,]+(?:\.\d+)?[KMB]?)\s*(?:posts?|videos?|uses?|creates?)$/i,
              /^([\d,]+)$/
            ];
            
            for (const pattern of patterns) {
              const match = text.trim().match(pattern);
              if (match) {
                let numStr = match[1].replace(/,/g, '');
                let num: number;
                if (numStr.includes('K')) {
                  num = parseFloat(numStr.replace('K', '')) * 1000;
                } else if (numStr.includes('M')) {
                  num = parseFloat(numStr.replace('M', '')) * 1000000;
                } else if (numStr.includes('B')) {
                  num = parseFloat(numStr.replace('B', '')) * 1000000000;
                } else {
                  num = parseInt(numStr);
                }
                
                if (num > 0) {
                  console.log(`Found post count via strong tag: ${text} -> ${num}`);
                  return Math.floor(num);
                }
              }
            }
          }
          return 0;
        },

        // Strategy 4: Search entire document for post count patterns
        () => {
          const bodyText = doc.body?.textContent || '';
          const patterns = [
            /(\d{1,3}(?:,\d{3})*(?:\.\d+)?[KMB]?)\s*(?:posts?|videos?|uses?|creates?)/gi,
            /"postCount":\s*(\d+)/gi,
            /"videoCount":\s*(\d+)/gi
          ];

          for (const pattern of patterns) {
            const matches = [...bodyText.matchAll(pattern)];
            if (matches.length > 0) {
              let bestMatch = 0;
              for (const match of matches) {
                let numStr = match[1].replace(/,/g, '');
                let num: number;
                if (numStr.includes('K')) {
                  num = parseFloat(numStr.replace('K', '')) * 1000;
                } else if (numStr.includes('M')) {
                  num = parseFloat(numStr.replace('M', '')) * 1000000;
                } else if (numStr.includes('B')) {
                  num = parseFloat(numStr.replace('B', '')) * 1000000000;
                } else {
                  num = parseInt(numStr);
                }
                
                if (num > bestMatch) {
                  bestMatch = Math.floor(num);
                }
              }
              
              if (bestMatch > 0) {
                console.log(`Found post count via text search: ${bestMatch}`);
                return bestMatch;
              }
            }
          }
          return 0;
        }
      ];

      // Try each strategy until we find a result
      for (const strategy of strategies) {
        const result = strategy();
        if (result > 0) {
          return result;
        }
      }

      console.log('Could not extract post count from HTML');
      return 0;

    } catch (error) {
      console.error('Error extracting post count:', error);
      return 0;
    }
  }

  private getStoredHistory(): StoredSoundHistory[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading stored history:', error);
      return [];
    }
  }

  private saveHistory(history: StoredSoundHistory[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  private updateSoundHistory(soundId: string, totalPosts: number): HistoricalDataEntry[] {
    const allHistory = this.getStoredHistory();
    let soundHistory = allHistory.find(h => h.soundId === soundId);

    if (!soundHistory) {
      soundHistory = {
        soundId,
        history: [],
        lastUpdated: new Date().toISOString()
      };
      allHistory.push(soundHistory);
    }

    const today = new Date().toISOString().split('T')[0];
    const existingEntry = soundHistory.history.find(h => h.date === today);

    if (existingEntry) {
      existingEntry.totalPosts = totalPosts;
    } else {
      const yesterday = soundHistory.history[soundHistory.history.length - 1];
      const dailyGrowth = yesterday ? totalPosts - yesterday.totalPosts : 0;
      
      soundHistory.history.push({
        date: today,
        totalPosts,
        dailyGrowth
      });
    }

    // Keep only last 30 days
    soundHistory.history = soundHistory.history.slice(-30);
    soundHistory.lastUpdated = new Date().toISOString();

    this.saveHistory(allHistory);
    return soundHistory.history;
  }

  async scrapeSingleSound(config: TikTokSoundConfig): Promise<ScrapedSoundData | null> {
    try {
      console.log(`Scraping ${config.name}: ${config.url}`);
      
      // Fetch the actual TikTok page
      const html = await this.fetchWithCORS(config.url);
      
      // Extract post count using the provided XPath strategy
      const totalPosts = this.extractPostCount(html, config.xpath);
      
      if (totalPosts === 0) {
        console.warn(`No post count found for ${config.name}, using fallback`);
        // If we can't extract, don't return null - return with 0 posts
      }
      
      const scrapedData: ScrapedSoundData = {
        id: config.id,
        name: config.name,
        url: config.url,
        totalPosts,
        lastUpdated: new Date().toISOString(),
        scrapedAt: new Date()
      };

      // Update historical data
      this.updateSoundHistory(config.id, totalPosts);

      console.log(`Successfully scraped ${config.name}: ${totalPosts} posts`);
      return scrapedData;

    } catch (error) {
      console.error(`Error scraping ${config.name}:`, error);
      return null;
    }
  }

  async scrapeAllSounds(): Promise<ScrapeResult> {
    const timestamp = new Date();
    const results: ScrapedSoundData[] = [];
    const errors: string[] = [];

    console.log('Starting TikTok scraping for all Zukenee sounds...');

    for (const config of ZUKENEE_SOUNDS) {
      try {
        const result = await this.scrapeSingleSound(config);
        if (result) {
          results.push(result);
        } else {
          errors.push(`Failed to scrape ${config.name}`);
        }
      } catch (error) {
        errors.push(`Error scraping ${config.name}: ${error}`);
      }
    }

    const success = results.length > 0;
    
    return {
      success,
      data: success ? results : undefined,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      timestamp
    };
  }

  convertToProcessedData(scrapedData: ScrapedSoundData[]): ProcessedSoundData[] {
    const allHistory = this.getStoredHistory();
    
    return scrapedData.map(sound => {
      const soundHistory = allHistory.find(h => h.soundId === sound.id);
      const history = soundHistory?.history || [];
      
      // Get recent daily growth
      const recentEntries = history.slice(-7); // Last 7 days
      const dailyGrowth = recentEntries.length > 0 
        ? recentEntries[recentEntries.length - 1].dailyGrowth 
        : 0;

      // Check for spike (growth > 2x average of last 7 days)
      const avgGrowth = recentEntries.length > 1
        ? recentEntries.slice(0, -1).reduce((sum, entry) => sum + entry.dailyGrowth, 0) / (recentEntries.length - 1)
        : 0;
      const isSpike = dailyGrowth > Math.max(avgGrowth * 2, 100);

      // Convert history to chart data
      const chartData = history.map(entry => ({
        date: entry.date,
        dailyPosts: entry.totalPosts,
        isSpike: entry.dailyGrowth > Math.max(avgGrowth * 2, 100)
      }));

      return {
        id: sound.id,
        name: sound.name,
        artist: 'Zukenee',
        totalPosts: sound.totalPosts,
        dailyGrowth,
        isSpike,
        lastUpdated: sound.lastUpdated,
        chartData
      };
    });
  }

  getHistoricalData(soundId: string): HistoricalDataEntry[] {
    const allHistory = this.getStoredHistory();
    const soundHistory = allHistory.find(h => h.soundId === soundId);
    return soundHistory?.history || [];
  }

  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const tiktokScraper = new TikTokScraperService();
