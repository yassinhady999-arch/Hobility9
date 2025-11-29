
import React, { useEffect, useState } from 'react';
import { fetchData, getMonthKey, saveTask, deleteTask, getErrorMessage, saveMentalState } from '../lib/storage';
import { UserProfile, AppData, DailyTask, MentalState } from '../types';
import { HabitTracker } from './HabitTracker';
import { DailyPlanner } from './DailyPlanner';
import { AnalysisPanel } from './AnalysisPanel';
import { ProgressChart, MentalChart } from './Charts';
import { Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProfileModal } from './ProfileModal';
import { translations } from '../lib/i18n';

interface Props {
  user: UserProfile;
  onLogout: () => void;
}

export const Dashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<AppData>({ habits: [], tasks: [], mentalState: [] });
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openPicker, setOpenPicker] = useState<{ day: number; type: 'mood' | 'motivation' } | null>(null);
  
  // Optimistic state for tasks
  const [optimisticTasks, setOptimisticTasks] = useState<DailyTask[]>([]);

  useEffect(() => {
    setOptimisticTasks(data.tasks);
  }, [data.tasks]);
  
  const monthKey = getMonthKey(currentDate);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const totalHabitGoals = data.habits.reduce((acc, h) => acc + h.goal, 0);
  const totalHabitsCompleted = data.habits.reduce((acc, h) => acc + h.completed_days.length, 0);
  const progressPercentage = totalHabitGoals > 0 ? (totalHabitsCompleted / totalHabitGoals) * 100 : 0;

  const dailyStats = days.map(day => {
    const activeHabitsCount = data.habits.filter(h => h.goal > 0).length; 
    const completedOnDay = data.habits.filter(h => h.completed_days.includes(day)).length;
    const percentage = activeHabitsCount > 0 ? (completedOnDay / activeHabitsCount) * 100 : 0;
    
    return {
        day,
        completed: completedOnDay,
        notCompleted: activeHabitsCount - completedOnDay,
        percentage
    };
  });

  const mentalStats = days.map(day => {
      const entry = data.mentalState.find(m => m.day === day);
      return {
          day,
          mood: entry?.mood || null,
          motivation: entry?.motivation || null
      };
  });

  const load = async () => {
    setLoading(true);
    const d = await fetchData(user.id, monthKey);
    setData(d);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user.id, monthKey]);

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (updates.theme) {
        if (updates.theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }
  };

  const handlePrevMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAddTask = async (day: number, title: string) => {
    const newTask = { id: `t-${Date.now()}`, user_id: user.id, day, title, completed: false, month_key: monthKey };
    const originalTasks = optimisticTasks;
    setOptimisticTasks(prev => [...prev, newTask]);
    try {
        await saveTask(newTask);
        load(); 
    } catch (error) {
        console.error("Failed to add task:", error);
        alert(`Failed to add task: ${getErrorMessage(error)}`);
        setOptimisticTasks(originalTasks); 
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const task = optimisticTasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };
    const originalTasks = optimisticTasks;
    setOptimisticTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

    try {
        await saveTask(updatedTask);
        // load(); // Removed to prevent reordering
    } catch (error) {
        console.error("Failed to update task:", error);
        alert(`Failed to update task: ${getErrorMessage(error)}`);
        setOptimisticTasks(originalTasks);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const originalTasks = optimisticTasks;
    setOptimisticTasks(prev => prev.filter(t => t.id !== taskId));
    try {
        await deleteTask(taskId);
        load();
    } catch (error) {
        console.error("Failed to delete task:", error);
        alert(`Failed to delete task: ${getErrorMessage(error)}`);
        setOptimisticTasks(originalTasks);
    }
  };

  const handleUpdateMentalState = async (day: number, mood: number | null, motivation: number | null) => {
    const existingMentalState = data.mentalState.find(m => m.day === day);
    const newMentalState: MentalState = {
      user_id: user.id,
      day,
      mood: mood,
      motivation: motivation,
      month_key: monthKey,
    };

    const originalMentalState = data.mentalState;
    setData(prevData => ({
      ...prevData,
      mentalState: existingMentalState
        ? prevData.mentalState.map(m => (m.day === day ? newMentalState : m))
        : [...prevData.mentalState, newMentalState],
    }));

    try {
      await saveMentalState(newMentalState);
    } catch (error) {
      console.error("Failed to update mental state:", error);
      alert(`Failed to update mental state: ${getErrorMessage(error)}`);
      setData(prevData => ({ ...prevData, mentalState: originalMentalState }));
    }
  };


  const t = translations[user.language || 'en'];
  // Force English month name
  const monthName = currentDate.toLocaleString('en-US', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 pb-12">
      
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
            <img 
              src="https://scontent.fcai19-8.fna.fbcdn.net/v/t39.30808-6/585354959_122167626314793204_3711938744597635491_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_ohc=mJHClZJ7p58Q7kNvwEE--zM&_nc_oc=AdmTYuTRT70nAt0053NNwUycQoc3yxZpHSR4f_1nYYKRWa4Uc_xcSzpdFrMV47zqArU&_nc_zt=23&_nc_ht=scontent.fcai19-8.fna&_nc_gid=0qH_jbDFEWt3n0ibs75A1w&oh=00_Afh3-N1D2lKAxvHpgMWFhoLRAmIgPAO1nSvIsNM4tNgskA&oe=692961B6" 
              alt="Logo" 
              className="w-14 h-14 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] border-2 border-blue-400 object-contain bg-white"
            />
            <h1 className="font-bold text-xl text-slate-700 dark:text-white">Hobility</h1>
        </div>
        <div className="flex gap-4">
            <button onClick={() => setIsProfileOpen(true)} className="text-slate-500 hover:text-blue-600 transition-colors">
                <Settings size={22} />
            </button>
            <button onClick={onLogout} className="text-slate-500 hover:text-red-600 transition-colors">
                <LogOut size={22} />
            </button>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
         
         <div className="flex flex-col lg:flex-row gap-6">
             {/* LEFT CARD: Month/Stats */}
             <div className="flex-1 bg-[#f2f2f2] dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-6 flex flex-col md:flex-row items-center justify-between shadow-sm">
                 <div className="flex items-center gap-4">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                        <ChevronLeft size={28} />
                    </button>
                    <div className="flex flex-col items-center">
                        <h2 className="text-4xl text-slate-600 dark:text-slate-300 tracking-tight font-normal">{monthName}</h2>
                        <span className="text-sm text-slate-400 font-medium">{year}</span>
                    </div>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                        <ChevronRight size={28} />
                    </button>
                 </div>
                 
                 <div className="flex gap-16 items-center mt-4 md:mt-0">
                    <div className="text-center">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Number of habits</div>
                        <div className="text-2xl font-medium text-slate-800 dark:text-white">{data.habits.length}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Completed habits</div>
                        <div className="text-2xl font-medium text-slate-800 dark:text-white">{totalHabitsCompleted}</div>
                    </div>
                 </div>
             </div>

             {/* RIGHT CARD: Progress (Fixed Width to align with Analysis) */}
             <div className="w-full lg:w-[320px] shrink-0 bg-[#f2f2f2] dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-6 flex flex-col justify-center shadow-sm">
                <div className="w-full">
                     <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <span>Progress</span>
                        <span>Progress in %</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="flex-1 h-8 bg-gray-300 dark:bg-slate-600 border border-gray-400 overflow-hidden relative">
                            <div className="h-full bg-[#95ea95]" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white text-xl">{progressPercentage.toFixed(2)}%</span>
                     </div>
                </div>
             </div>
         </div>

         <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 bg-white dark:bg-slate-800 overflow-x-auto shadow-sm">
                <HabitTracker 
                    habits={data.habits} 
                    monthKey={monthKey} 
                    userId={user.id} 
                    refresh={load}
                    currentDate={currentDate}
                />
            </div>

            <div className="w-full lg:w-[320px] shrink-0">
                <AnalysisPanel habits={data.habits} />
            </div>
         </div>

         {/* Stats Tables & Charts */}
         <div className="overflow-x-auto border border-slate-300 dark:border-slate-600 bg-[#e0e0e0] dark:bg-slate-800">
             <table className="w-full min-w-[1000px] text-xs text-center border-collapse table-fixed">
                 <tbody>
                     <tr className="h-7">
                         <td className="w-24 px-2 font-medium text-slate-700 bg-[#d9d9d9] dark:bg-slate-700 border border-slate-400 dark:border-slate-600 text-left">Progress</td>
                         {dailyStats.map(s => (
                             <td key={s.day} className="border border-slate-400 dark:border-slate-600 bg-[#f2f2f2] dark:bg-slate-800 text-slate-600 font-medium">
                                 {Math.round(s.percentage)}%
                             </td>
                         ))}
                     </tr>
                     <tr className="h-7">
                         <td className="w-24 px-2 font-medium text-slate-700 bg-[#d9d9d9] dark:bg-slate-700 border border-slate-400 dark:border-slate-600 text-left">Done</td>
                         {dailyStats.map(s => (
                             <td key={s.day} className="border border-slate-400 dark:border-slate-600 bg-[#f2f2f2] dark:bg-slate-800 text-slate-600">
                                 {s.completed}
                             </td>
                         ))}
                     </tr>
                     <tr className="h-7">
                         <td className="w-24 px-2 font-medium text-slate-700 bg-[#d9d9d9] dark:bg-slate-700 border border-slate-400 dark:border-slate-600 text-left">Not Done</td>
                         {dailyStats.map(s => (
                             <td key={s.day} className="border border-slate-400 dark:border-slate-600 bg-[#e6e6e6] dark:bg-slate-800 text-slate-600">
                                 {s.notCompleted}
                             </td>
                         ))}
                     </tr>
                 </tbody>
             </table>
         </div>

         <div className="h-56 border border-slate-300 dark:border-slate-600 bg-[#e7efe7] dark:bg-slate-800 p-0 relative">
             <ProgressChart data={dailyStats} />
         </div>

         <div className="border border-slate-300 dark:border-slate-600 bg-[#e0e0e0] dark:bg-slate-800 mt-4">
            <div className="bg-[#d9d9d9] dark:bg-slate-700 text-center py-1 text-xs text-slate-700 border-b border-slate-400 dark:border-slate-600">Mental State</div>
             <table className="w-full min-w-[1000px] text-xs text-center border-collapse table-fixed">
                 <tbody>
                     <tr className="h-7">
                         <td className="w-24 px-2 font-medium text-slate-700 bg-[#d9d9d9] dark:bg-slate-700 border border-slate-400 dark:border-slate-600 text-left">Mood</td>
                         {days.map(day => {
                             const currentMentalState = mentalStats.find(m => m.day === day);
                             const currentMood = currentMentalState?.mood || null;
                             const currentMotivation = currentMentalState?.motivation || null;
                             const isMoodPickerOpen = openPicker?.day === day && openPicker?.type === 'mood';

                             return (
                                 <td key={day} className="border border-slate-400 dark:border-slate-600 bg-[#f2f2f2] dark:bg-slate-800 text-slate-600 relative">
                                     <button
                                         onClick={() => setOpenPicker(isMoodPickerOpen ? null : { day, type: 'mood' })}
                                         className={`w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center transition-colors mx-auto
                                             ${currentMood !== null ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-300 dark:hover:bg-blue-600'}`}
                                     >
                                         {currentMood !== null ? currentMood : '-'}
                                     </button>

                                     {isMoodPickerOpen && (
                                         <div className="absolute z-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg py-1 mt-1 left-1/2 -translate-x-1/2">
                                             {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                                                 <button
                                                     key={`mood-picker-${day}-${value}`}
                                                     onClick={() => {
                                                         handleUpdateMentalState(day, value, currentMotivation);
                                                         setOpenPicker(null);
                                                     }}
                                                     className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600
                                                         ${currentMood === value ? 'bg-blue-100 dark:bg-blue-800' : ''}`}
                                                 >
                                                     {value}
                                                 </button>
                                             ))}
                                         </div>
                                     )}
                                 </td>
                             );
                         })}
                     </tr>
                     <tr className="h-7">
                         <td className="w-24 px-2 font-medium text-slate-700 bg-[#d9d9d9] dark:bg-slate-700 border border-slate-400 dark:border-slate-600 text-left">Motivation</td>
                         {days.map(day => {
                             const currentMentalState = mentalStats.find(m => m.day === day);
                             const currentMood = currentMentalState?.mood || null;
                             const currentMotivation = currentMentalState?.motivation || null;
                             const isMotivationPickerOpen = openPicker?.day === day && openPicker?.type === 'motivation';

                             return (
                                 <td key={day} className="border border-slate-400 dark:border-slate-600 bg-[#e6e6e6] dark:bg-slate-800 text-slate-600 relative">
                                     <button
                                         onClick={() => setOpenPicker(isMotivationPickerOpen ? null : { day, type: 'motivation' })}
                                         className={`w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center transition-colors mx-auto
                                             ${currentMotivation !== null ? 'bg-purple-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-purple-300 dark:hover:bg-purple-600'}`}
                                     >
                                         {currentMotivation !== null ? currentMotivation : '-'}
                                     </button>

                                     {isMotivationPickerOpen && (
                                         <div className="absolute z-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg py-1 mt-1 left-1/2 -translate-x-1/2">
                                             {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                                                 <button
                                                     key={`motivation-picker-${day}-${value}`}
                                                     onClick={() => {
                                                         handleUpdateMentalState(day, currentMood, value);
                                                         setOpenPicker(null);
                                                     }}
                                                     className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600
                                                         ${currentMotivation === value ? 'bg-purple-100 dark:bg-purple-800' : ''}`}
                                                 >
                                                     {value}
                                                 </button>
                                             ))}
                                         </div>
                                     )}
                                 </td>
                             );
                         })}
                     </tr>
                 </tbody>
             </table>
         </div>

         <div className="h-56 border border-slate-300 dark:border-slate-600 bg-[#fcf5f7] dark:bg-slate-800 p-0 relative">
             <MentalChart data={data.mentalState} />
         </div>

         <div className="pt-8">
             <DailyPlanner 
                startDay={1} 
                endDay={daysInMonth} 
                tasks={optimisticTasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                isRTL={user.language === 'ar'}
                currentDate={currentDate}
             />
         </div>

      </main>

      <ProfileModal 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={user}
        onUpdateProfile={handleUpdateProfile}
        currentLang={user.language || 'en'}
        onSignOut={onLogout}
      />
    </div>
  );
};
