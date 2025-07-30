import { useState, useEffect } from 'react';
import { ProcessedSoundData } from '@/types/googleSheets';
import { tiktokScraper } from '@/services/tiktokScraper';

export function useZukeneeData() {
  const [data, setData] = useState<ProcessedSoundData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting TikTok scraping...');
      const scrapeResult = await tiktokScraper.scrapeAllSounds();
      
      if (scrapeResult.success && scrapeResult.data) {
        const processedData = tiktokScraper.convertToProcessedData(scrapeResult.data);
        setData(processedData);
        setLastUpdated(new Date());
        console.log(`Successfully scraped ${processedData.length} Zukenee sounds`);
      } else {
        throw new Error(scrapeResult.error || 'Failed to scrape TikTok data');
      }
    } catch (err) {
      console.error('Error scraping TikTok data:', err);
      setError(err instanceof Error ? err.message : 'Failed to scrape data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 2 hours for TikTok scraping
  useEffect(() => {
    const interval = setInterval(fetchData, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}