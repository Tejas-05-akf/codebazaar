'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, Profile } from './supabase';

export type AdminViewMode = 'admin' | 'buyer' | 'seller';

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  viewMode: AdminViewMode | null;
  setViewMode: (mode: AdminViewMode) => void;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, name: string, role: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  bypassLogin: () => void;
  bypassSuperAdminLogin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  viewMode: null,
  setViewMode: () => {},
  login: async () => ({ error: null }),
  signup: async () => ({ error: null }),
  logout: async () => {},
  refreshUser: async () => {},
  bypassLogin: () => {},
  bypassSuperAdminLogin: () => {},
});

const STORAGE_KEY = 'cb_admin_view_mode';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewModeState] = useState<AdminViewMode | null>(null);

  const isAdmin = !!user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');
  const isSuperAdmin = !!user && user.role === 'SUPER_ADMIN';

  const fetchUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      const profileData = profile as Profile || null;
      setUser(profileData);
      // If user is SUPER_ADMIN, restore viewMode from localStorage
      if (profileData?.role === 'SUPER_ADMIN') {
        const saved = localStorage.getItem(STORAGE_KEY) as AdminViewMode | null;
        if (saved && ['admin', 'buyer', 'seller'].includes(saved)) {
          setViewModeState(saved);
        } else {
          setViewModeState('admin');
        }
      } else {
        setViewModeState(null);
      }
    } else {
      setUser(null);
      setViewModeState(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      (async () => { await fetchUser(); })();
    });
    return () => subscription.unsubscribe();
  }, [fetchUser]);

  const setViewMode = useCallback((mode: AdminViewMode) => {
    setViewModeState(mode);
    if (isSuperAdmin) {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }, [isSuperAdmin]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signup = async (email: string, password: string, name: string, role: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });
    return { error: error?.message || null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setViewModeState(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const bypassLogin = () => {
    const adminProfile: Profile = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@codebazaar.in',
      name: 'Admin User',
      role: 'ADMIN',
      avatar_url: null,
      is_verified: true,
      is_banned: false,
      created_at: new Date().toISOString(),
    };
    setUser(adminProfile);
    setViewModeState(null);
    setIsLoading(false);
  };

  const bypassSuperAdminLogin = () => {
    const superAdminProfile: Profile = {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'superadmin@codebazaar.in',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      avatar_url: null,
      is_verified: true,
      is_banned: false,
      created_at: new Date().toISOString(),
    };
    setUser(superAdminProfile);
    setViewModeState('admin');
    localStorage.setItem(STORAGE_KEY, 'admin');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAdmin,
      viewMode,
      setViewMode,
      login,
      signup,
      logout,
      refreshUser,
      bypassLogin,
      bypassSuperAdminLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
