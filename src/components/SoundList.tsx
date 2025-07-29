import { useState } from 'react';
import { TikTokSound } from '@/types/tiktok';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SoundChart } from '@/components/SoundChart';
import { TrendingUp, TrendingDown, Zap, Search, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SoundListProps {
  sounds: TikTokSound[];
}

const SoundList = ({ sounds }: SoundListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'growth' | 'total'>('growth');
  const [selectedSound, setSelectedSound] = useState<TikTokSound | null>(null);

  // Filter sounds based on search term
  const filteredSounds = sounds.filter(sound =>
    sound.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort sounds
  const sortedSounds = [...filteredSounds].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'growth':
        return b.dailyGrowth - a.dailyGrowth;
      case 'total':
        return b.totalPosts - a.totalPosts;
      default:
        return 0;
    }
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getGrowthColor = (growth: number, isSpike: boolean) => {
    if (isSpike) return 'text-spike-red';
    if (growth > 50) return 'text-growth-green';
    if (growth < 10) return 'text-muted-foreground';
    return 'text-primary';
  };

  if (selectedSound) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setSelectedSound(null)}
          className="mb-4"
        >
          ← Back to list
        </Button>
        <SoundChart sound={selectedSound} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sounds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'growth' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('growth')}
          >
            Growth
          </Button>
          <Button
            variant={sortBy === 'total' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('total')}
          >
            Total
          </Button>
          <Button
            variant={sortBy === 'name' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('name')}
          >
            Name
          </Button>
        </div>
      </div>

      {/* Sounds Grid */}
      <div className="grid gap-4">
        {sortedSounds.map((sound) => (
          <Card
            key={sound.id}
            className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedSound(sound)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-card-foreground">
                    {sound.name}
                  </h3>
                  {sound.isSpike && (
                    <Badge variant="destructive" className="bg-gradient-spike">
                      <Zap className="h-3 w-3 mr-1" />
                      Spike!
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    {formatNumber(sound.totalPosts)} posts
                  </div>
                  
                  <div className={`flex items-center gap-1 ${getGrowthColor(sound.dailyGrowth, sound.isSpike)}`}>
                    {sound.dailyGrowth > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    +{formatNumber(sound.dailyGrowth)} today
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2">
                  Last updated: {new Date(sound.lastUpdated).toLocaleString()}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  View Chart
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {sortedSounds.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No sounds found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export { SoundList };