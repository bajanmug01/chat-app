'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import Header from '../../components/Header';
import { useRouter } from 'next/navigation';
import Avatar from '../../components/Avatar';

export default function ProfilePage() {
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

  // Get user metadata
  const fullName = user.user_metadata?.full_name as string;
  const firstName = user.user_metadata?.first_name as string;
  const lastName = user.user_metadata?.last_name as string;
  
  // Get user display name
  const displayName = fullName ?? 
    (firstName && lastName ? `${firstName} ${lastName}` : 
    (firstName ?? lastName ?? user.email ?? ''));
  
  // Get user avatar URL
  const avatarUrl = user.user_metadata?.avatar_url as string;
  
  // Get initials for avatar fallback
  const initials = firstName && lastName 
    ? `${firstName[0]}${lastName[0]}`
    : displayName.substring(0, 2);

  return (
    <>
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
          
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-8">
            <div className="flex flex-col items-center">
              <Avatar 
                src={avatarUrl} 
                alt={`${displayName}'s avatar`}
                fallback={initials}
                size="lg"
              />
              <p className="mt-2 text-sm text-gray-500">Profile Picture</p>
            </div>
            
            <div className="flex-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <p className="mt-1 text-gray-900">{firstName || 'Not set'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <p className="mt-1 text-gray-900">{lastName || 'Not set'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-gray-900">{fullName || 'Not set'}</p>
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Account ID</label>
                  <p className="mt-1 text-gray-900">{user.id}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <p className="text-gray-500">Profile editing coming soon!</p>
          </div>
        </div>
      </main>
    </>
  );
} 