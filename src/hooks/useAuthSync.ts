'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/store/userStore';

/**
 * Hook to sync Supabase auth state to Zustand store.
 * Should be mounted once at the app/layout level.
 */
export function useAuthSync() {
  const { setUser, setSession, reset } = useUserStore();

  useEffect(() => {
    const supabase = createClient();

    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) reset();
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, reset]);
}
