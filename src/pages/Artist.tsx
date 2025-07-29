import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Zap, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SoundList } from '@/components/SoundList';
import { mockData, createZukeneeArtist, convertGoogleSheetsToTikTokSound } from '@/data/mockData';
import { useZukeneeData } from '@/hooks/useZukeneeData';
import { ArtistType, type Artist } from '@/types/tiktok';

const Artist = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();
  const { data: zukeneeSheetData, loading: zukeneeLoading, error: zukeneeError, refetch } = useZukeneeData();
  const [artists, setArtists] = useState<Record<'zukenee' | 'bnyx', Artist>>(mockData);
  
  if (!artistId || !['zukenee', 'bnyx'].includes(artistId)) {
    navigate('/');
    return null;
  }

  // Update Zukenee data when Google Sheets data is loaded
  useEffect(() => {
    if (zukeneeSheetData && zukeneeSheetData.length > 0) {
      const zukeneeData = convertGoogleSheetsToTikTokSound(zukeneeSheetData);
      const zukeneeArtist = createZukeneeArtist(zukeneeData);
      
      setArtists(prev => ({
        ...prev,
        zukenee: zukeneeArtist
      }));
    }
  }, [zukeneeSheetData]);

  const artist = artists[artistId as ArtistType];
  const totalSoundsWithSpikes = artist.sounds.filter(sound => sound.isSpike).length;
  const totalDailyGrowth = artist.sounds.reduce((sum, sound) => sum + sound.dailyGrowth, 0);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold bg-gradient-tiktok bg-clip-text text-transparent">
                  {artist.name}
                </h1>
                {artistId === 'zukenee' && (
                  <>
                    {zukeneeLoading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {!zukeneeError && zukeneeSheetData.length > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="bg-green-500 rounded-full w-2 h-2" />
                        <span className="text-xs text-green-500">Live</span>
                      </div>
                    )}
                    {zukeneeError && (
                      <Button variant="ghost" size="sm" onClick={refetch}>
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {artist.sounds.length} sounds • {artist.totalSpikes} total spikes this week
                {artistId === 'zukenee' && zukeneeSheetData.length > 0 && (
                  <span className="ml-2">
                    • <ExternalLink className="h-3 w-3 inline ml-1" />
                    <a 
                      href="https://docs.google.com/spreadsheets/d/1jhaGQjnxoBUOQvmvzRiAF2D5zr0KNKFOolol50l7Vsk/edit?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs"
                    >
                      View Sheet
                    </a>
                  </span>
                )}
              </p>
            </div>
            {totalSoundsWithSpikes > 0 && (
              <div className="flex items-center gap-2 bg-gradient-spike px-3 py-2 rounded-lg">
                <Zap className="h-4 w-4" />
                <span className="font-semibold text-sm">
                  {totalSoundsWithSpikes} spiking
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Data Source Info */}
        {artistId === 'zukenee' && (
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Data Source</h3>
                <p className="text-sm text-muted-foreground">
                  {zukeneeError 
                    ? 'Using fallback data due to connection error'
                    : zukeneeSheetData.length > 0 
                      ? 'Live data from Google Sheets'
                      : 'Loading from Google Sheets...'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                {zukeneeLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                <Button variant="outline" size="sm" onClick={refetch}>
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {artist.sounds.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Sounds</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-growth-green">
              {totalDailyGrowth.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Daily Growth</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-spike-red">
              {totalSoundsWithSpikes}
            </div>
            <div className="text-sm text-muted-foreground">Spiking Today</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">
              {artist.totalSpikes}
            </div>
            <div className="text-sm text-muted-foreground">Week Spikes</div>
          </Card>
        </div>

        {/* Loading State */}
        {artistId === 'zukenee' && zukeneeLoading && artist.sounds.length === 0 && (
          <Card className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading sound data from Google Sheets...</p>
          </Card>
        )}

        {/* Error State */}
        {artistId === 'zukenee' && zukeneeError && artist.sounds.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-destructive mb-4">⚠️ Unable to load data from Google Sheets</div>
            <p className="text-muted-foreground mb-4">
              There was an error connecting to the Google Sheets. Please check the sheet permissions and try again.
            </p>
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </Card>
        )}

        {/* Sounds List */}
        {artist.sounds.length > 0 && <SoundList sounds={artist.sounds} />}
      </div>
    </div>
  );
};

export default Artist;