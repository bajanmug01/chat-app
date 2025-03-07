'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';
import Header from '../../components/Header';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
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
          <h1 className="text-2xl font-bold mb-6">Chat</h1>
          
          <div className="border rounded-lg h-96 mb-4 p-4 overflow-y-auto">
            <p className="text-gray-500 text-center">No messages yet. Start a conversation!</p>
          </div>
          
          <div className="flex">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors">
              Send
            </button>
          </div>
        </div>
      </main>
    </>
  );
} 