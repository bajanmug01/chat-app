'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import Header from '../../components/Header';
import { useRouter } from 'next/navigation';

export default function GroupsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      
      if (!sessionUser) {
        // Redirect to sign in if not logged in
        router.push('/signin');
        return;
      }
      
      setUser(sessionUser);
      setLoading(false);
      
      // Set up auth state listener
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          
          // Redirect to sign in if logged out
          if (!currentUser) {
            router.push('/signin');
          }
        }
      );
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    void checkUser();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <>
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Groups</h1>
          
          <p className="text-gray-500">Groups feature coming soon!</p>
        </div>
      </main>
    </>
  );
} 