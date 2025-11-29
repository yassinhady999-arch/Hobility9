
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

const ADMIN_USERNAME = 'yassin admin';
const ADMIN_PASS = '12345qwert';
const ADMIN_SUPABASE_EMAIL = 'yassin.admin.hobility@gmail.com';

export const Auth: React.FC<{ onLogin: (u: UserProfile) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const ensureAdminRole = async (userId: string) => {
      // Force update the role to 'admin' in the database.
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);

      if (roleError) {
          console.error("Failed to enforce admin role:", roleError);
      }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // --- ADMIN LOGIN PATH ---
    if (email.toLowerCase() === ADMIN_USERNAME && password === ADMIN_PASS) {
      try {
        // Try normal sign in first
        let { data, error: authError } = await supabase.auth.signInWithPassword({
          email: ADMIN_SUPABASE_EMAIL,
          password: ADMIN_PASS,
        });

        // If user not found (invalid login credentials), try to Create the admin user
        if (authError && authError.message.includes('Invalid login credentials')) {
             console.log("Admin user missing or wrong password. Attempting to create...");
             const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: ADMIN_SUPABASE_EMAIL,
                password: ADMIN_PASS,
                options: { data: { full_name: 'System Administrator' } }
             });

             if (signUpError) {
                 // Check if it failed because user exists (but maybe pass was wrong above?)
                 if (signUpError.message.includes('User already registered')) {
                     throw new Error('Admin user exists but password mismatch. Please check Supabase Auth.');
                 }
                 throw signUpError;
             }
             
             // Wait a moment for propagation
             await new Promise(r => setTimeout(r, 1000));

             // Sign in again after creation
             const res = await supabase.auth.signInWithPassword({
                email: ADMIN_SUPABASE_EMAIL,
                password: ADMIN_PASS,
             });
             data = res.data;
             authError = res.error;
        }

        if (authError) throw authError;
        if (!data.session) throw new Error("Admin session not returned.");

        // AUTO-PROMOTE
        await ensureAdminRole(data.session.user.id);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        const adminProfile: UserProfile = {
          id: data.session.user.id,
          email: data.session.user.email!,
          full_name: profileData?.full_name || 'Administrator',
          theme: profileData?.theme || 'light',
          role: 'admin', 
          language: profileData?.language || 'en',
        };

        onLogin(adminProfile);

      } catch (err: any) {
        console.error("Admin login error:", err);
        setError(err.message || 'Admin login failed.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // --- REGULAR USER LOGIN PATH ---
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) throw authError;
      if (!data.session) throw new Error('No session returned from login.');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      const userProfile: UserProfile = {
        id: data.session.user.id,
        email: data.session.user.email!,
        full_name: profileData?.full_name || data.session.user.email?.split('@')[0] || 'User',
        theme: profileData?.theme || 'light',
        role: profileData?.role || 'user',
        language: profileData?.language || 'en',
        expiryDate: profileData?.expiry_date || undefined
      };
      
      if (userProfile.expiryDate && new Date(userProfile.expiryDate) < new Date()) {
          setError("Your account has expired. Please contact the administrator.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
      }

      onLogin(userProfile);

    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.message && err.message.toLowerCase().includes('email not confirmed')) {
        setError('Email not confirmed. Please check your inbox or ask the admin to disable email confirmation in Supabase settings.');
      } else {
        setError(err.message || 'Invalid login credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
            <div className="relative inline-block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-3xl blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
              <img 
                src="https://scontent.fcai19-8.fna.fbcdn.net/v/t39.30808-6/585354959_122167626314793204_3711938744597635491_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_ohc=mJHClZJ7p58Q7kNvwEE--zM&_nc_oc=AdmTYuTRT70nAt0053NNwUycQoc3yxZpHSR4f_1nYYKRWa4Uc_xcSzpdFrMV47zqArU&_nc_zt=23&_nc_ht=scontent.fcai19-8.fna&_nc_gid=0qH_jbDFEWt3n0ibs75A1w&oh=00_Afh3-N1D2lKAxvHpgMWFhoLRAmIgPAO1nSvIsNM4tNgskA&oe=692961B6" 
                alt="Logo" 
                className="relative w-36 h-36 rounded-3xl mx-auto mb-6 object-contain bg-white border-4 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.6)] ring-4 ring-blue-500/20"
              />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">Hobility</h1>
            <p className="text-slate-500 mt-2">Professional Habit & Task Manager</p>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded mb-4 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
            <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email or Username</label>
                <input 
                    type="text" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                    placeholder="Enter your email or 'Yassin admin'"
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                    placeholder="••••••••"
                />
            </div>
            
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-blue-600/30 disabled:opacity-70 flex justify-center items-center"
            >
                {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : 'Log In'}
            </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-400">
                Don't have an account? <br/>
                <span className="text-slate-600 dark:text-slate-300 font-medium">Please contact the Administrator.</span>
            </p>
        </div>
      </div>
    </div>
  );
};
