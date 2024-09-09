import { useRecoilState } from 'recoil';
import { supabaseClient } from '../providers/supabase';
import { authState } from '../recoil/atoms/auth';
import type { User } from '../types/User';
import { useEffect } from 'react';

export type Auth = {
  user: User | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

export const useAuth = () => {
  const [auth, setAuth] = useRecoilState(authState);

  const signUp = async (email: string, password: string): Promise<void> => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    await supabaseClient.auth.signUp({
      email,
      password,
    });
  };

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
  };

  const logout = () => {
    supabaseClient.auth.signOut();
    setAuth(null);
  };

  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      if (!user) {
        setAuth(null);
        return;
      }
      setAuth({
        id: user.id,
        email: user.email ?? '',
      });
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setAuth]);

  return {
    user: auth,
    isAuthenticated: !!auth,
    signUp,
    login,
    logout,
  };
};
