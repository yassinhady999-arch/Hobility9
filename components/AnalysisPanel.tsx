import React from 'react';
import { Habit } from '../types';

interface AnalysisPanelProps {
  habits: Habit[];
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ habits }) => {
  return (
    <div className="h-full bg-[#f2f2f2] border border-slate-400 flex flex-col">
      {/* Header */}
      <div className="bg-[#d9d9d9] py-2 text-center border-b border-slate-400">
        <h3 className="text-sm text-slate-700 font-medium">Analysis</h3>
      </div>
      
      {/* Table */}
      <table className="w-full text-xs border-collapse">
        <thead className="bg-[#cccccc] text-slate-700 font-bold">
          <tr>
            <th className="py-1 px-1 text-center border-b border-r border-slate-400 w-1/4">Goal</th>
            <th className="py-1 px-1 text-center border-b border-r border-slate-400 w-1/4">Actual</th>
            <th className="py-1 px-2 text-left border-b border-slate-400">Progress</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {habits.length > 0 ? habits.map((habit, idx) => {
            const progress = habit.goal > 0 ? (habit.completed_days.length / habit.goal) * 100 : 0;
            return (
              <tr key={habit.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]'}`}>
                <td className="py-1.5 px-1 text-center border-b border-r border-slate-200 text-slate-600 font-mono">
                  {habit.goal}
                </td>
                <td className="py-1.5 px-1 text-center border-b border-r border-slate-200 text-slate-800 font-mono font-medium">
                  {habit.completed_days.length}
                </td>
                <td className="py-1.5 px-2 border-b border-slate-200">
                  <div className="w-full bg-slate-200 h-4">
                    <div className="h-full bg-[#95ea95]" style={{ width: `${Math.min(100, progress)}%` }}></div>
                  </div>
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan={3} className="p-4 text-center text-slate-400 italic">
                No data to analyze
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
