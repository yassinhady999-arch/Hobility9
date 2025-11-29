import React, { useState } from 'react';
import { DailyTask } from '../types';
import { saveTask, deleteTask } from '../lib/storage';
import { Plus, Trash2, Square, CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  tasks: DailyTask[];
  monthKey: string;
  userId: string;
  refresh: () => void;
}

export const Planner: React.FC<Props> = ({ tasks, monthKey, userId, refresh }) => {
  // Pagination logic for weeks (simplified to 7 day chunks)
  const [weekOffset, setWeekOffset] = useState(0);
  const startDay = (weekOffset * 7) + 1;
  const weekDays = Array.from({length: 7}, (_, i) => startDay + i).filter(d => d <= 30);

  const addTask = async (day: number, title: string) => {
    const newTask: DailyTask = {
        id: `t-${Date.now()}`,
        user_id: userId,
        day,
        title,
        completed: false,
        month_key: monthKey
    };
    await saveTask(newTask);
    refresh();
  };

  const toggleTask = async (task: DailyTask) => {
    await saveTask({ ...task, completed: !task.completed });
    refresh();
  };

  const removeTask = async (id: string) => {
    // FIX: The `deleteTask` function expects only one argument (the task ID). The `monthKey` argument has been removed.
    await deleteTask(id);
    refresh();
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-between items-center px-2">
         <h3 className="text-xl font-bold text-slate-700 dark:text-white">Weekly Tasks</h3>
         <div className="flex gap-2">
            <button disabled={weekOffset === 0} onClick={() => setWeekOffset(w => w - 1)} className="p-2 bg-white dark:bg-slate-800 rounded shadow disabled:opacity-50"><ChevronLeft size={20}/></button>
            <button disabled={weekOffset >= 3} onClick={() => setWeekOffset(w => w + 1)} className="p-2 bg-white dark:bg-slate-800 rounded shadow disabled:opacity-50"><ChevronRight size={20}/></button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 overflow-x-auto pb-4">
        {weekDays.map(day => (
            <DayColumn 
                key={day} 
                day={day} 
                tasks={tasks.filter(t => t.day === day)} 
                onAdd={(t) => addTask(day, t)}
                onToggle={toggleTask}
                onDelete={removeTask}
            />
        ))}
      </div>
    </div>
  );
};

const DayColumn: React.FC<{
    day: number, 
    tasks: DailyTask[], 
    onAdd: (t: string) => void,
    onToggle: (t: DailyTask) => void,
    onDelete: (id: string) => void
}> = ({ day, tasks, onAdd, onToggle, onDelete }) => {
    const [input, setInput] = useState('');

    return (
        <div className="min-w-[160px] bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full">
            <div className="bg-indigo-500 text-white p-2 text-center font-bold rounded-t-lg">Day {day}</div>
            <div className="p-2 space-y-2 flex-1 min-h-[150px]">
                {tasks.map(t => (
                    <div key={t.id} className="flex items-start gap-2 group">
                        <button onClick={() => onToggle(t)} className="mt-0.5 text-slate-400 hover:text-indigo-500">
                            {t.completed ? <CheckSquare size={16} className="text-green-500"/> : <Square size={16} />}
                        </button>
                        <span className={`text-xs flex-1 ${t.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{t.title}</span>
                        <button onClick={() => onDelete(t.id)} className="opacity-0 group-hover:opacity-100 text-red-400">
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1">
                    <input 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if(e.key === 'Enter' && input.trim()) {
                                onAdd(input.trim());
                                setInput('');
                            }
                        }}
                        placeholder="Add..."
                        className="w-full text-xs bg-transparent outline-none dark:text-white"
                    />
                    <Plus size={14} className="text-slate-400" />
                </div>
            </div>
        </div>
    )
}