
import React, { useState, useEffect } from 'react';
import { DailyTask } from '../types';
import { Plus, Trash2, ChevronLeft, ChevronRight, Calendar, Check } from 'lucide-react';

interface DailyPlannerProps {
  startDay: number;
  endDay: number;
  tasks: DailyTask[];
  onAddTask: (day: number, title: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  isRTL: boolean;
  currentDate: Date;
}

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const size = 120;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center py-4 w-full">
      <svg height={size} width={size} className="transform -rotate-90">
        <circle
          stroke="#e0e0e0"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
        />
        <circle
          stroke="#95c585"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="butt"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          r={radius}
          cx={center}
          cy={center}
        />
      </svg>
      <span className="absolute text-2xl font-bold text-slate-600 dark:text-slate-300">{Math.round(percentage)}%</span>
    </div>
  );
};

export const DailyPlanner: React.FC<DailyPlannerProps> = ({
  startDay,
  endDay,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  currentDate
}) => {
  const days = Array.from({ length: endDay - startDay + 1 }, (_, i) => startDay + i);

  const [scrollIndex, setScrollIndex] = useState(0);
  const itemsPerPage = 7; 

  useEffect(() => {
    setScrollIndex(0);
  }, [currentDate.getMonth(), currentDate.getFullYear()]);
  
  const visibleDays = days.slice(scrollIndex, scrollIndex + itemsPerPage);
  
  // Navigate by week (7 days)
  const handlePrev = () => setScrollIndex(curr => Math.max(0, curr - itemsPerPage));
  const handleNext = () => setScrollIndex(curr => {
      const next = curr + itemsPerPage;
      return next >= days.length ? curr : next;
  });

  const getDayInfo = (dayNumber: number) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[date.getDay()];
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return { name: dayName, date: `${dd}.${mm}.${yyyy}` };
  };

  const currentWeekNumber = Math.floor(scrollIndex / 7) + 1;
  const weekStartStr = visibleDays.length > 0 ? getDayInfo(visibleDays[0]).date : '';
  const weekEndStr = visibleDays.length > 0 ? getDayInfo(visibleDays[visibleDays.length - 1]).date : '';

  return (
    <div className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-2 gap-4">
            <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Daily Planner</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium border border-green-200 dark:border-green-800 shadow-sm">
                    <Calendar size={14} />
                    <span>Week {currentWeekNumber}</span>
                    <span className="text-slate-400 mx-1">|</span>
                    <span className="text-xs opacity-90">{weekStartStr} - {weekEndStr}</span>
                </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto justify-end">
                 <button 
                    onClick={handlePrev} 
                    disabled={scrollIndex === 0} 
                    className="p-2 bg-white dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm font-medium border border-slate-200 dark:border-slate-600 shadow-sm text-slate-700 dark:text-slate-200"
                 >
                    <ChevronLeft size={18} />
                    <span className="hidden sm:inline">Prev Week</span>
                 </button>
                 <button 
                    onClick={handleNext} 
                    disabled={scrollIndex + itemsPerPage >= days.length} 
                    className="p-2 bg-slate-800 dark:bg-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm font-medium shadow-md"
                 >
                    <span className="hidden sm:inline">Next Week</span>
                    <ChevronRight size={18} />
                 </button>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-6">
            {visibleDays.map(day => (
                <DayCard 
                    key={day}
                    day={day}
                    info={getDayInfo(day)}
                    tasks={tasks.filter(t => t.day === day)}
                    onAdd={(t) => onAddTask(day, t)}
                    onToggle={onToggleTask}
                    onDelete={onDeleteTask}
                />
            ))}
        </div>
    </div>
  );
};

const DayCard: React.FC<{
    day: number,
    info: { name: string, date: string },
    tasks: DailyTask[],
    onAdd: (t: string) => void,
    onToggle: (id: string) => void,
    onDelete: (id: string) => void
}> = ({ day, info, tasks, onAdd, onToggle, onDelete }) => {
    const [newTask, setNewTask] = useState('');
    
    const completedCount = tasks.filter(t => t.completed).length;
    const notCompletedCount = tasks.length - completedCount;
    const percentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
    
    const handleAdd = () => {
        if(newTask.trim()) {
            onAdd(newTask.trim());
            setNewTask('');
        }
    };

    return (
        <div className="flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full">
            <div className="bg-[#95c585] dark:bg-green-700 py-3 text-center text-white">
                <div className="font-bold text-lg leading-tight">{info.name}</div>
                <div className="text-xs font-medium opacity-90 mt-1">{info.date}</div>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <CircularProgress percentage={percentage} />
            </div>

            <div className="flex flex-col flex-1">
                <div className="bg-[#95c585] dark:bg-green-700 py-1.5 text-center text-white font-bold text-sm shadow-sm z-10">
                    Tasks List
                </div>

                <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 relative custom-scrollbar max-h-[300px]">
                    {tasks.map((task) => (
                        <div key={task.id} className={`flex items-center justify-between px-3 py-2.5 border-b border-slate-100 dark:border-slate-700 text-xs group ${task.completed ? 'bg-[#f0fdf4] dark:bg-green-900/20' : 'bg-white dark:bg-slate-800'}`}>
                            <div className={`truncate flex-1 font-medium transition-colors ${task.completed ? 'line-through text-black dark:text-black' : 'text-slate-700 dark:text-slate-200'}`}>
                                {task.title}
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                <button onClick={() => onToggle(task.id)} className="focus:outline-none">
                                    <div className={`
                                        w-4 h-4 rounded-[3px] flex items-center justify-center transition-all border
                                        ${task.completed 
                                            ? 'border-black bg-black' // Black border, black bg when checked
                                            : 'border-slate-300 bg-white hover:border-slate-400' 
                                        }
                                    `}>
                                        {task.completed && <Check size={12} className="text-white" strokeWidth={3} />}
                                    </div>
                                </button>
                                <button onClick={() => onDelete(task.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                     {tasks.length === 0 && (
                        <div className="p-4 text-center text-slate-400 text-xs italic">
                            No tasks for today.
                        </div>
                     )}
                </div>

                <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                     <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-green-500/50 transition-all shadow-sm">
                        <input 
                            value={newTask} 
                            onChange={e => setNewTask(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAdd()}
                            placeholder="Add task..." 
                            className="flex-1 text-xs outline-none bg-transparent text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                        />
                        <button 
                            onClick={handleAdd} 
                            className="text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors p-1"
                        >
                             <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
