
import React from 'react';
import { UserProfile } from '../types';
import { translations, Language } from '../lib/i18n';
import { X } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  currentLang: Language;
  onSignOut: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  currentLang,
  onSignOut
}) => {
  if (!isOpen || !profile) return null;
  const t = translations[currentLang];

  const handleSignOut = () => {
    onSignOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-100">{t.settings}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold mb-2">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{profile.full_name}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.language}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateProfile({ language: 'en' })}
                  className={`p-2 rounded text-sm border ${profile.language === 'en' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}
                >
                  {t.english}
                </button>
                <button
                  onClick={() => onUpdateProfile({ language: 'ar' })}
                  className={`p-2 rounded text-sm border ${profile.language === 'ar' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}
                >
                  {t.arabic}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.theme}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateProfile({ theme: 'light' })}
                  className={`p-2 rounded text-sm border ${profile.theme === 'light' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}
                >
                  {t.light}
                </button>
                <button
                  onClick={() => onUpdateProfile({ theme: 'dark' })}
                  className={`p-2 rounded text-sm border ${profile.theme === 'dark' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}
                >
                  {t.dark}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <button 
            onClick={handleSignOut}
            className="w-full py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            {t.signOut}
          </button>
        </div>
      </div>
    </div>
  );
};
