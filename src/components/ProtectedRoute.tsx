'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to sign in
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If no user and not loading, don't render children (will redirect in useEffect)
  if (!user) {
    return null;
  }

  // If user is authenticated, render children
  return <>{children}</>;
} 