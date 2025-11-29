import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max, 
  color = "bg-green-400", 
  height = "h-4",
  showLabel = false
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="w-full flex items-center gap-2">
      <div className={`flex-grow bg-gray-200 rounded-sm overflow-hidden ${height}`}>
        <div 
          className={`${color} h-full transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-mono w-8 text-right">{Math.round(percentage)}%</span>}
    </div>
  );
};
