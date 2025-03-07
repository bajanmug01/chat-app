'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Define the shape of our auth context
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => Promise.resolve(),
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Props for the AuthProvider component
type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Function to check the current user session
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user ?? null;
        setUser(sessionUser);
        setLoading(false);
      } catch (error) {
        console.error('Error checking auth session:', error);
        setLoading(false);
      }
    };

    // Initial check
    void checkUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);
      }
    );

    // Clean up the subscription when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Function to sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Provide the auth context to children
  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
} 