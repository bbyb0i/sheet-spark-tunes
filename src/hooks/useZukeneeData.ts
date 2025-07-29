import { useState, useEffect } from 'react';
import { ProcessedSoundData } from '@/types/googleSheets';
import { fetchZukeneeData } from '@/services/googleSheets';

export function useZukeneeData() {
  const [data, setData] = useState<ProcessedSoundData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchZukeneeData();
      setData(result);
      setLastUpdated(new Date());
      
      console.log(`Loaded ${result.length} Zukenee sounds from Google Sheets`);
    } catch (err) {
      console.error('Error loading Zukenee data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchData, 5 * 60 * 1000);
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