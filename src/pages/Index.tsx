import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, Music, Zap } from 'lucide-react';
import { mockData } from '@/data/mockData';

const Index = () => {
  const navigate = useNavigate();

  const totalSpikes = Object.values(mockData).reduce((sum, artist) => sum + artist.totalSpikes, 0);
  const totalSounds = Object.values(mockData).reduce((sum, artist) => sum + artist.sounds.length, 0);
  const activeSpikesSounds = Object.values(mockData).reduce((sum, artist) => 
    sum + artist.sounds.filter(sound => sound.isSpike).length, 0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-tiktok text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              TikTok Sound Tracker
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-6">
              Real-time analytics for trending sounds and viral spikes
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalSounds}</div>
                <div className="text-sm opacity-80">Total Sounds</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">{activeSpikesSounds}</div>
                <div className="text-sm opacity-80">Spiking Now</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-300">{totalSpikes}</div>
                <div className="text-sm opacity-80">Week Spikes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artist Selection */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Select Artist</h2>
          <p className="text-muted-foreground">
            Choose an artist to view their TikTok sound performance data
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Zukenee Card */}
          <Card className="p-8 hover:shadow-glow transition-all duration-300 group">
            <div className="text-center space-y-6">
              <div className="bg-gradient-tiktok rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <Music className="h-10 w-10 text-primary-foreground" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-2">Zukenee</h3>
                <p className="text-muted-foreground mb-4">
                  Electronic & Synthwave Artist
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-primary">{mockData.zukenee.sounds.length}</div>
                    <div className="text-muted-foreground">Sounds</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-spike-red">
                      {mockData.zukenee.sounds.filter(s => s.isSpike).length}
                    </div>
                    <div className="text-muted-foreground">Spiking</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-growth-green">
                      {mockData.zukenee.sounds.reduce((sum, s) => sum + s.dailyGrowth, 0).toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">Daily +</div>
                  </div>
                </div>
              </div>
              
              <Button
                variant="artist"
                size="xl"
                onClick={() => navigate('/artist/zukenee')}
                className="w-full group-hover:scale-105"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                View Analytics
              </Button>
            </div>
          </Card>

          {/* BNYX Card */}
          <Card className="p-8 hover:shadow-glow transition-all duration-300 group">
            <div className="text-center space-y-6">
              <div className="bg-gradient-tiktok rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <Zap className="h-10 w-10 text-primary-foreground" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-2">BNYX</h3>
                <p className="text-muted-foreground mb-4">
                  Trap & Bass Producer
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-primary">{mockData.bnyx.sounds.length}</div>
                    <div className="text-muted-foreground">Sounds</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-spike-red">
                      {mockData.bnyx.sounds.filter(s => s.isSpike).length}
                    </div>
                    <div className="text-muted-foreground">Spiking</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-growth-green">
                      {mockData.bnyx.sounds.reduce((sum, s) => sum + s.dailyGrowth, 0).toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">Daily +</div>
                  </div>
                </div>
              </div>
              
              <Button
                variant="artist"
                size="xl"
                onClick={() => navigate('/artist/bnyx')}
                className="w-full group-hover:scale-105"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                View Analytics
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              Live data updates • Spike detection • Mobile optimized
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
