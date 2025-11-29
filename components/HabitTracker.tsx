
import React, { useState, useRef, useEffect } from 'react';
import { Habit } from '../types';
import { Plus, Trash2, Check, X, ChevronDown } from 'lucide-react';
import { saveHabit, deleteHabit, getErrorMessage } from '../lib/storage';

interface Props {
  habits: Habit[];
  monthKey: string;
  userId: string;
  refresh: () => void;
  currentDate?: Date;
}

const EMOJI_CATEGORIES = [
  { name: 'Activities', icons: ['🏃', '🏋️', '🧘', '🏊', '🚴', '⚽', '🏀', '🎾', '🥊', '🤸', '🧗', '🏄', '🚶', '💃', '🎳', '⛳'] },
  { name: 'Health', icons: ['💧', '🥦', '🍎', '🥗', '🥕', '💊', '💤', '🦷', '🚿', '🧴', '🥑', '🍌', '🚭', '🍺', '🥤', '🥥'] },
  { name: 'Productivity', icons: ['📚', '💻', '📝', '📅', '⏰', '📈', '🧹', '🧠', '💼', '📧', '📞', '💡', '🔋', '🛠️', '⚙️', '🗑️', '🛒'] },
  { name: 'Creative', icons: ['🎨', '🎸', '🎹', '📷', '✍️', '🎭', '🎤', '🧶', '🎮', '🧩', '🎲', '🎧', '🍳', '🧵', '🪴', '🎻'] },
  { name: 'Finance', icons: ['💰', '💳', '🏦', '💵', '🛍️', '🎁', '🐖', '💎'] },
  { name: 'Nature & Misc', icons: ['☀️', '🌙', '⭐', '☁️', '🌧️', '❄️', '🌲', '🐾', '🐶', '🐱', '🚗', '✈️', '🏠', '❤️', '🔥', '✨', '🚫', '✅', '⚠️'] },
];

export const HabitTracker: React.FC<Props> = ({ habits, monthKey, userId, refresh, currentDate = new Date() }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
      name: '',
      icon: '🔹',
      goal: 30
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const [optimisticHabits, setOptimisticHabits] = useState<Habit[]>(habits);

  useEffect(() => {
    setOptimisticHabits(habits);
  }, [habits]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
      return { num: i + 1, name: dayName };
  });

  const weeks = [
      { id: 1, label: "Week 1", start: 1, end: 7 },
      { id: 2, label: "Week 2", start: 8, end: 14 },
      { id: 3, label: "Week 3", start: 15, end: 21 },
      { id: 4, label: "Week 4", start: 22, end: daysInMonth },
  ];

  const toggleDay = async (habit: Habit, day: number) => {
    // Optimistic Update
    const originalHabit = { ...habit, completed_days: [...habit.completed_days] };
    const exists = habit.completed_days.includes(day);
    const newDays = exists 
      ? habit.completed_days.filter(d => d !== day)
      : [...habit.completed_days, day];
    
    const updatedHabit = { ...habit, completed_days: newDays };

    setOptimisticHabits(prev => prev.map(h => h.id === habit.id ? updatedHabit : h));
    
    try {
        await saveHabit(updatedHabit);
        refresh(); 
    } catch (err: any) {
        console.error("Failed to save habit status", err);
        setOptimisticHabits(prev => prev.map(h => h.id === habit.id ? originalHabit : h));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      user_id: userId,
      name: formData.name,
      icon: formData.icon || '🔹',
      goal: Number(formData.goal) || daysInMonth,
      completed_days: [],
      month_key: monthKey
    };

    const originalHabits = optimisticHabits;
    setOptimisticHabits(prev => [...prev, newHabit]);
    setIsModalOpen(false);
    setFormData({ name: '', icon: '🔹', goal: daysInMonth });

    try {
        await saveHabit(newHabit);
        refresh();
    } catch (error) {
        console.error("Failed to save new habit:", error);
        alert(`Error: Could not save the new habit.\nReason: ${getErrorMessage(error)}`);
        setOptimisticHabits(originalHabits);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Delete this habit?')) {
        const originalHabits = optimisticHabits;
        setOptimisticHabits(prev => prev.filter(h => h.id !== id));
        try {
            await deleteHabit(id);
            refresh();
        } catch (error) {
            console.error("Failed to delete habit:", error);
            alert(`Error: Could not delete the habit.\nReason: ${getErrorMessage(error)}`);
            setOptimisticHabits(originalHabits);
        }
    }
  };

  const getWeekColorClass = (weekId: number) => {
      return weekId % 2 === 0 ? 'bg-[#cccccc]' : 'bg-[#e0e0e0]';
  };
  
  const getDayColorClass = (day: number) => {
      const week = weeks.find(w => day >= w.start && day <= w.end);
      if (!week) return 'bg-white';
      return week.id % 2 === 0 ? 'bg-[#f4f4f4]' : 'bg-white';
  };

  return (
    <div className="h-full flex flex-col border border-slate-300 bg-white relative">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs font-sans table-fixed min-w-[900px]">
            <thead>
               <tr>
                   <th className="bg-[#d9d9d9] border-r border-b border-slate-400 w-48 text-left px-4 py-2 text-slate-800 font-bold text-sm">
                      <div className="flex justify-between items-center">
                          <span>My Habits</span>
                          <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-slate-600 hover:bg-slate-700 text-white rounded p-1 transition-colors shadow-sm"
                            title="Add New Habit"
                          >
                              <Plus size={14} />
                          </button>
                      </div>
                   </th>
                   {weeks.map(week => (
                       <th 
                           key={week.id} 
                           colSpan={week.end - week.start + 1} 
                           className={`${getWeekColorClass(week.id)} border-r border-b border-slate-400 text-center py-1 text-slate-600 font-normal`}
                       >
                          {week.label}
                       </th>
                   ))}
               </tr>
               <tr>
                   <th className="bg-[#e6e6e6] border-r border-b border-slate-400"></th>
                   {days.map(d => (
                       <th key={d.num} className={`${getDayColorClass(d.num)} border-r border-b border-slate-400 w-7 h-10 min-w-[28px] p-0 text-center`}>
                          <div className="text-[10px] text-slate-500 leading-tight">{d.name}</div>
                          <div className="text-xs font-medium text-slate-800">{d.num}</div>
                       </th>
                   ))}
               </tr>
            </thead>
            <tbody>
                {optimisticHabits.map(habit => (
                    <tr key={habit.id} className="group hover:bg-blue-50/30 transition-colors">
                        <td className="border-r border-b border-slate-300 bg-[#e6e6e6] group-hover:bg-[#d9d9d9] transition-colors p-0 relative">
                            <div className="flex justify-between items-center h-8 px-3 w-full">
                                <span className="font-medium text-slate-700 truncate">{habit.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-base">{habit.icon}</span>
                                    <button onClick={() => handleDelete(habit.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        </td>
                        {days.map(d => {
                            const isChecked = habit.completed_days.includes(d.num);
                            const cellBgClass = getDayColorClass(d.num); 

                            return (
                                <td key={d.num} className={`border-r border-b border-slate-300 p-0 text-center h-8 ${cellBgClass}`} onClick={() => toggleDay(habit, d.num)}>
                                    <div className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-green-50/50">
                                        <div 
                                          className={`w-4 h-4 rounded-[1px] flex items-center justify-center transition-colors duration-75 border
                                            ${isChecked 
                                              ? 'bg-slate-700 border-slate-800' // Dark square for checked
                                              : 'bg-white border-slate-300 hover:border-slate-400'
                                            }
                                          `}
                                        >
                                            {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                                        </div>
                                    </div>
                                </td>
                            );
                        })}
                    </tr>
                ))}
                {optimisticHabits.length === 0 && (
                    <tr>
                        <td colSpan={daysInMonth + 1} className="p-8 text-center text-slate-400 italic bg-white border-b border-slate-300">
                            Click the + button above to add your first habit.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-sm animate-slide-up border border-slate-200 dark:border-slate-700 relative overflow-visible">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Add New Habit</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Habit Name</label>
                        <input 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Morning Jog"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div ref={emojiPickerRef} className="relative">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Icon</label>
                            <button 
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-between focus:ring-2 focus:ring-blue-500"
                            >
                                <span className="text-lg">{formData.icon}</span>
                                <ChevronDown size={16} className="text-slate-400" />
                            </button>
                            
                            {showEmojiPicker && (
                                <div className="absolute top-full left-0 w-[300px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg z-[1000] mt-1 max-h-[300px] overflow-y-auto p-3 custom-scrollbar">
                                    <div className="grid grid-cols-4 gap-2">
                                        {EMOJI_CATEGORIES.flatMap(cat => cat.icons).map((icon, idx) => (
                                            <button 
                                                key={idx}
                                                type="button"
                                                onClick={() => { setFormData({...formData, icon}); setShowEmojiPicker(false); }}
                                                className={`h-10 w-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-xl transition-colors ${formData.icon === icon ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' : ''}`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Monthly Goal</label>
                            <input 
                                type="number"
                                value={formData.goal}
                                onChange={e => setFormData({...formData, goal: parseInt(e.target.value) || 0})}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                min="1"
                                max="31"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 rounded-b-lg">
                    <button 
                        onClick={() => setIsModalOpen(false)} 
                        className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors shadow-sm"
                    >
                        Save Habit
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
