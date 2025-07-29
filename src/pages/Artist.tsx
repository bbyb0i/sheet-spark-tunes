import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { SoundList } from '@/components/SoundList';
import { mockData } from '@/data/mockData';
import { ArtistType } from '@/types/tiktok';

const Artist = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();
  
  if (!artistId || !['zukenee', 'bnyx'].includes(artistId)) {
    navigate('/');
    return null;
  }

  const artist = mockData[artistId as ArtistType];
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
              <h1 className="text-2xl font-bold bg-gradient-tiktok bg-clip-text text-transparent">
                {artist.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                {artist.sounds.length} sounds • {artist.totalSpikes} total spikes this week
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

        {/* Sounds List */}
        <SoundList sounds={artist.sounds} />
      </div>
    </div>
  );
};

export default Artist;