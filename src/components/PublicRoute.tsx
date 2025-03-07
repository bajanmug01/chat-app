'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

type PublicRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export default function PublicRoute({ 
  children, 
  redirectTo = '/chat' 
}: PublicRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and user exists, redirect to specified path
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If user is authenticated, don't render children (will redirect in useEffect)
  if (user) {
    return null;
  }

  // If no user, render children
  return <>{children}</>;
} 