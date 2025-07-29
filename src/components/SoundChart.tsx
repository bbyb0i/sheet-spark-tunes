import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { TikTokSound } from '@/types/tiktok';
import { Card } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface SoundChartProps {
  sound: TikTokSound;
}

const SoundChart = ({ sound }: SoundChartProps) => {
  const maxValue = Math.max(...sound.chartData.map(d => d.dailyPosts));
  const avgValue = sound.chartData.reduce((sum, d) => sum + d.dailyPosts, 0) / sound.chartData.length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-card-foreground font-medium">{label}</p>
          <p className="text-primary">
            Daily Posts: {payload[0].value.toLocaleString()}
          </p>
          {data.isSpike && (
            <p className="text-spike-red flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Spike detected!
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isSpike) {
      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill="hsl(var(--spike-red))"
            stroke="hsl(var(--background))"
            strokeWidth={2}
          />
          <text
            x={cx}
            y={cy - 15}
            textAnchor="middle"
            fill="hsl(var(--spike-red))"
            fontSize={16}
          >
            🚀
          </text>
        </g>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">
          {sound.name}
        </h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total: {sound.totalPosts.toLocaleString()}</span>
          <span className={`flex items-center gap-1 ${sound.isSpike ? 'text-spike-red' : 'text-growth-green'}`}>
            {sound.isSpike && <Zap className="h-3 w-3" />}
            Today: +{sound.dailyGrowth.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sound.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={avgValue + 100} 
              stroke="hsl(var(--spike-red))" 
              strokeDasharray="2 2" 
              label={{ value: "Spike Line", position: "insideTopRight" }}
            />
            <Line
              type="monotone"
              dataKey="dailyPosts"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export { SoundChart };