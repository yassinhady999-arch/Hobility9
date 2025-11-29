
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Crown } from 'lucide-react';

interface ProFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProFeaturesModal: React.FC<ProFeaturesModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: "1. Select the first day & write a quote",
      description: "Select the first day of the week for the tracker to update, and write a quote that will motivate you!",
      visual: (
        <div className="w-full h-48 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 w-2 h-16 bg-green-500/20 rounded"></div>
          <div className="text-xl font-serif text-slate-700 text-center mb-4 italic">"Inspiration comes only during work"</div>
          <div className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">Start of the week: 02.11.2025</div>
          <div className="mt-2 bg-white shadow p-2 rounded border border-slate-200 text-xs">
             <div className="grid grid-cols-7 gap-1">
               {[...Array(7)].map((_, i) => <div key={i} className="w-4 h-4 bg-slate-200 rounded-full"></div>)}
             </div>
          </div>
        </div>
      )
    },
    {
      title: "2. Plan out all your tasks",
      description: "Plan out all your tasks for the week and get started! Visualize your workload.",
      visual: (
        <div className="w-full h-48 bg-slate-100 rounded-lg border border-slate-200 p-2 grid grid-cols-4 gap-2 overflow-hidden">
           {[...Array(4)].map((_, i) => (
             <div key={i} className="flex flex-col gap-1">
                <div className="h-4 bg-green-600/80 rounded w-full"></div>
                <div className="h-12 w-12 rounded-full border-4 border-green-400 mx-auto my-1 flex items-center justify-center text-[10px] font-bold text-slate-600">{70 + i * 5}%</div>
                <div className="space-y-1">
                   <div className="h-2 bg-slate-300 rounded w-full"></div>
                   <div className="h-2 bg-slate-300 rounded w-3/4"></div>
                   <div className="h-2 bg-slate-300 rounded w-full"></div>
                </div>
             </div>
           ))}
        </div>
      )
    },
    {
      title: "3. Analyze your efficiency",
      description: "Analyze your efficiency throughout the week! Visual charts help you stay on track.",
      visual: (
        <div className="w-full h-48 bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-4 justify-center">
          <div className="flex items-end gap-2 h-32">
             <div className="w-4 bg-green-600 h-[60%] rounded-t"></div>
             <div className="w-4 bg-green-600 h-[80%] rounded-t"></div>
             <div className="w-4 bg-green-600 h-[40%] rounded-t"></div>
             <div className="w-4 bg-green-600 h-[90%] rounded-t"></div>
             <div className="w-4 bg-green-600 h-[20%] rounded-t"></div>
          </div>
          <div className="relative w-24 h-24 flex items-center justify-center">
             <div className="absolute inset-0 rounded-full border-8 border-slate-100"></div>
             <div className="absolute inset-0 rounded-full border-8 border-green-500 border-t-transparent border-l-transparent rotate-45"></div>
             <span className="text-2xl font-bold text-slate-700">66%</span>
          </div>
        </div>
      )
    },
    {
      title: "4. Track habits",
      description: "Track habits or recurring tasks. Habits and tasks in one space!",
      visual: (
        <div className="w-full h-48 bg-white rounded-lg border border-slate-200 p-2 overflow-hidden flex flex-col">
          <div className="bg-green-600 text-white text-center py-1 text-sm font-bold rounded-t">Habit Tracker</div>
          <div className="flex-1 overflow-hidden space-y-2 p-2">
             {[...Array(5)].map((_, i) => (
               <div key={i} className="flex items-center gap-2">
                 <div className="w-24 h-3 bg-slate-200 rounded"></div>
                 <div className="flex gap-1">
                    <div className="w-3 h-3 bg-slate-400 rounded"></div>
                    <div className="w-3 h-3 bg-slate-400 rounded"></div>
                    <div className="w-3 h-3 border border-slate-300 rounded"></div>
                 </div>
                 <div className="flex-1 h-3 bg-green-200 rounded overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${(i+1)*15}%` }}></div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )
    },
    {
      title: "5. Leave notes & thoughts",
      description: "Leave notes, acknowledgments, and new thoughts every day!",
      visual: (
        <div className="w-full h-48 bg-white rounded-lg border border-slate-200 p-2 grid grid-cols-3 gap-2">
           <div className="border border-slate-200 rounded p-1">
              <div className="bg-green-600 text-white text-[10px] text-center mb-1">Notes</div>
              <div className="h-1 w-full bg-slate-200 mb-1"></div>
              <div className="h-1 w-3/4 bg-slate-200"></div>
           </div>
           <div className="border border-slate-200 rounded p-1">
              <div className="bg-green-600 text-white text-[10px] text-center mb-1">Improve?</div>
              <div className="h-1 w-full bg-slate-200 mb-1"></div>
              <div className="h-1 w-1/2 bg-slate-200"></div>
           </div>
           <div className="border border-slate-200 rounded p-1">
              <div className="bg-green-600 text-white text-[10px] text-center mb-1">Thanks</div>
              <div className="h-1 w-full bg-slate-200 mb-1"></div>
              <div className="h-1 w-full bg-slate-200"></div>
           </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-amber-500">
            <Crown size={24} fill="currentColor" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Hobility</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8 flex flex-col items-center">
          
          {/* Visual Container */}
          <div className="w-full mb-6 shadow-lg rounded-lg overflow-hidden transform transition-all duration-500">
             {slides[currentSlide].visual}
          </div>

          {/* Text Content */}
          <div className="text-center space-y-3 min-h-[100px]">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{slides[currentSlide].title}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-lg">{slides[currentSlide].description}</p>
          </div>

          {/* Dots Indicator */}
          <div className="flex gap-2 mt-6">
            {slides.map((_, index) => (
              <div 
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${index === currentSlide ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              />
            ))}
          </div>

        </div>

        {/* Footer / Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
          <button 
            onClick={prevSlide}
            className="flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <button 
            onClick={nextSlide}
            className="flex items-center gap-1 px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-md"
          >
            {currentSlide === slides.length - 1 ? 'Finish' : 'Next'}
            {currentSlide !== slides.length - 1 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};