import React from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { HourlyForecast } from '../types';

interface TrendChartProps {
  data: HourlyForecast[];
  unit: 'C' | 'F';
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, unit }) => {
  return (
    <div className="h-32 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '8px', border: 'none', color: 'white' }}
            itemStyle={{ color: 'white' }}
            labelStyle={{ display: 'none' }}
            formatter={(value: number) => [`${value}°${unit}`, '']}
          />
          <Area
            type="monotone"
            dataKey="temperature"
            stroke="#ffffff"
            strokeWidth={3}
            fill="url(#colorTemp)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};