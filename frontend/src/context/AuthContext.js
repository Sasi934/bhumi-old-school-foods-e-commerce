import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

// ⚙️ SET YOUR ADMIN EMAIL HERE (or in .env as REACT_APP_ADMIN_EMAIL)
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'admin@bhumifoods.in';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user);
      else { setProfile(null); setIsAdmin(false); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    // Check admin by email or profile flag
    const adminByEmail = authUser.email === ADMIN_EMAIL;
    const adminByFlag = data?.is_admin === true;

    // If admin by email but not flagged yet, update DB
    if (adminByEmail && !adminByFlag) {
      await supabase.from('profiles').update({ is_admin: true }).eq('id', authUser.id);
    }

    setProfile(data);
    setIsAdmin(adminByEmail || adminByFlag);
    setLoading(false);
  };

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setProfile(null); setIsAdmin(false);
  };

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from('profiles').update(updates).eq('id', user.id).select().single();
    if (!error) setProfile(data);
    return { data, error };
  };

  return (
    <AuthContext.Provider value={{
      user, profile, isAdmin, loading,
      signUp, signIn, signOut, updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
