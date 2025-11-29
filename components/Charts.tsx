import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { MentalState } from '../types';

export const ProgressChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#95ea95" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#95ea95" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="percentage" 
            stroke="#7bc47b" 
            strokeWidth={3}
            fill="url(#colorProgress)" 
            animationDuration={1000}
            baseLine={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MentalChart: React.FC<{ data: MentalState[] }> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => a.day - b.day);
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sortedData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d8b4c6" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#d8b4c6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorMotivation" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="mood" 
            stroke="#c48da6" 
            strokeWidth={3}
            fill="url(#colorMood)" 
            connectNulls
            animationDuration={1000}
            baseLine={0}
          />
          <Area 
            type="monotone" 
            dataKey="motivation" 
            stroke="#8884d8" 
            strokeWidth={3}
            fill="url(#colorMotivation)" 
            connectNulls
            animationDuration={1000}
            baseLine={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};