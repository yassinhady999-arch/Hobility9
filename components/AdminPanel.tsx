
import React, { useState, useEffect } from 'react';
import { Search, LogOut, Calendar, Lock, User, Plus, X, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { translations, Language } from '../lib/i18n';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Create a secondary client for "Sign Up" operations so we don't log the admin out
const SUPABASE_URL = 'https://davdkdedhtqauyeecwgv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdmRrZGVkaHRxYXV5ZWVjd2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzkxNDIsImV4cCI6MjA3OTgxNTE0Mn0.020js1gVypBOYd25mtKRlerr63p2JH9QKNL_NG-LMzs';

interface AdminPanelProps {
  onSignOut: () => void;
  lang: Language;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onSignOut, lang }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ fullName: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const t = translations[lang];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setError(null);
    try {
        const { data, error: fetchError } = await supabase.from('profiles').select('*');
        if (fetchError) throw fetchError;
        setUsers(data as UserProfile[]);
    } catch (err: any) {
        console.error("Error loading users:", err);
        setError(`Failed to load users: ${err.message}. Please check your RLS policies in Supabase.`);
    }
  };

  const handleUpdateExpiry = async (userId: string, newDate: string) => {
     try {
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ expiry_date: newDate })
            .eq('id', userId);

        if (updateError) throw updateError;
        
        // Refresh local state on success
        setUsers(users.map(u => u.id === userId ? { ...u, expiryDate: newDate } : u));
     } catch (err: any) {
         alert(`Failed to update expiry: ${err.message}`);
     }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setError(null);
    
    if (!newUserForm.fullName || !newUserForm.email || !newUserForm.password) {
        alert(t.fillFields);
        return;
    }

    setIsLoading(true);
    
    try {
        const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // 1. Create user in Supabase Auth
        const { data: authData, error: signUpError } = await tempClient.auth.signUp({
            email: newUserForm.email,
            password: newUserForm.password,
            options: {
                data: { full_name: newUserForm.fullName }
            }
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error("User not created in Auth.");

        // 2. Update the auto-created profile with the password (for admin visibility)
        // Note: The trigger creates the profile, but we update it here to add the password field if your schema supports it
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ password: newUserForm.password, full_name: newUserForm.fullName })
            .eq('id', authData.user.id);

        if (profileError) {
             console.warn("Could not update profile with password:", profileError.message);
        }

        // 3. Refresh user list to show the new user
        await loadUsers();
        
        setSuccessMsg(t.userAdded);
        
        setTimeout(() => {
            setIsAddModalOpen(false);
            setSuccessMsg('');
            setNewUserForm({ fullName: '', email: '', password: '' });
        }, 2000);

    } catch (err: any) {
        console.error("Add user failed:", err);
        setError(err.message || 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpired = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-6 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex justify-between items-center border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 text-white p-3 rounded-full">
              <Lock size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  {t.adminPanel}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">System Administrator</p>
            </div>
          </div>
          <button 
            onClick={onSignOut}
            className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            <LogOut size={18} />
            <span>{t.signOut}</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between gap-4 items-center">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <User size={20} /> {t.usersList} ({filteredUsers.length})
                </h2>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors shadow-sm"
                >
                    <Plus size={16} />
                    {t.addUser}
                </button>
            </div>
            
            <div className="relative w-full md:w-72">
              <input 
                type="text" 
                placeholder={t.searchUser}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            </div>
          </div>
          
          {error && <div className="p-4 bg-red-50 text-red-700 border-b border-red-200">{error}</div>}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3">{t.fullName}</th>
                  <th className="px-6 py-3">{t.email}</th>
                  <th className="px-6 py-3">{t.password}</th>
                  <th className="px-6 py-3 text-center">{t.status}</th>
                  <th className="px-6 py-3">{t.expiryDate}</th>
                  <th className="px-6 py-3 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const expiry = (user as any).expiry_date || user.expiryDate;
                  const expired = isExpired(expiry);
                  
                  return (
                    <tr key={user.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {user.full_name}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {user.email}
                      </td>
                       <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400 select-all">
                        {user.password || '***'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${expired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {expired ? t.expired : t.active}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-slate-400" />
                            <input 
                                type="date"
                                value={expiry ? new Date(expiry).toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    if (!isNaN(date.getTime())) {
                                        handleUpdateExpiry(user.id, date.toISOString());
                                    }
                                }}
                                className="bg-transparent border border-slate-300 dark:border-slate-600 rounded p-1 text-slate-800 dark:text-slate-200"
                            />
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                             const current = expiry ? new Date(expiry) : new Date();
                             const now = new Date();
                             const base = current < now ? now : current;
                             base.setDate(base.getDate() + 30);
                             handleUpdateExpiry(user.id, base.toISOString());
                          }}
                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                        >
                          +30 Days
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                    <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                            No users found. Click "Add New User" to create one.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md animate-scale-in">
             <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-lg">
                <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">{t.addUser}</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>
             </div>
             
             {successMsg ? (
                 <div className="p-6 text-center">
                     <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                         <CheckCircle size={32} />
                     </div>
                     <p className="text-green-700 font-medium mb-2">{t.userAdded}</p>
                 </div>
             ) : (
                <form onSubmit={handleAddUser} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded flex items-center gap-2">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.fullName}</label>
                        <input 
                            type="text"
                            required
                            value={newUserForm.fullName}
                            onChange={(e) => setNewUserForm({...newUserForm, fullName: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. John Doe"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.email}</label>
                        <input 
                            type="email"
                            required
                            value={newUserForm.email}
                            onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="user@example.com"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.password}</label>
                        <input 
                            type="text"
                            required
                            value={newUserForm.password}
                            onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                            placeholder="Set a password for the user"
                        />
                        <p className="text-xs text-slate-500 mt-1">The user will use this password to log in.</p>
                     </div>
                     <div className="pt-2 flex justify-end gap-2">
                         <button 
                            type="button" 
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                         >
                            {t.cancel}
                         </button>
                         <button 
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                         >
                            <Save size={16} />
                            {isLoading ? t.loading : t.save}
                         </button>
                     </div>
                </form>
             )}
          </div>
        </div>
      )}
    </div>
  );
};
