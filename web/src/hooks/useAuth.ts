import { useRecoilState } from 'recoil';
import { supabaseClient } from '../providers/supabase';
import { authState } from '../recoil/atoms/auth';
import type { User } from '../types/User';
import { useEffect } from 'react';

export type Auth = {
  user: User | null;
  isAuthenticatd: boolean;
  login: () => void;
  logout: () => void;
};

const AUTH_PROVIDER = 'google';

export const useAuth = () => {
  const [auth, setAuth] = useRecoilState(authState);

  const login = async () => {
    await supabaseClient.auth.signInWithOAuth({ provider: AUTH_PROVIDER });
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
        name: user.user_metadata.full_name,
        email: user.email ?? '',
      });
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setAuth]);

  return {
    user: auth,
    isAuthenticatd: !!auth,
    login,
    logout,
  };
};
