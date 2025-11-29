
import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { UserProfile } from './types';
import { supabase } from './lib/supabase';

// Define the Admin Email here for consistency
const ADMIN_SUPABASE_EMAIL = 'yassin.admin.hobility@gmail.com';

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, sessionEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Force 'admin' role on the frontend if emails match, regardless of DB state
      // This solves the issue where DB updates might lag or race conditions occur
      const role = (sessionEmail === ADMIN_SUPABASE_EMAIL) ? 'admin' : (data.role as 'user' | 'admin');

      setUser({
        id: data.id,
        email: data.email || sessionEmail || '',
        full_name: data.full_name,
        theme: data.theme as 'light' | 'dark',
        role: role,
        language: data.language as 'en' | 'ar',
        expiryDate: data.expiry_date
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      // Fallback
      setUser({
        id: userId,
        email: sessionEmail || '',
        full_name: 'User',
        theme: 'light',
        role: (sessionEmail === ADMIN_SUPABASE_EMAIL) ? 'admin' : 'user',
        language: 'en'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        if (!user || user.id !== session.user.id) {
            setLoading(true);
            fetchProfile(session.user.id, session.user.email);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;

  if (user) {
    if (user.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    if (user.role === 'admin') {
      return <AdminPanel onSignOut={handleLogout} lang={user.language || 'en'} />;
    }
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return <Auth onLogin={setUser} />;
}

export default App;
