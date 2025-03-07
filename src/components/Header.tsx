'use client';

import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './Avatar';

interface HeaderProps {
  user?: User; // Make user optional since we'll get it from context if not provided
}

export default function Header({ user: propUser }: HeaderProps) {
  const { user: contextUser, signOut } = useAuth();
  const user = propUser ?? contextUser; // Use prop user if provided, otherwise use from context
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // If no user is available, don't render the header
  if (!user) return null;
  
  const handleSignOut = async () => {
    await signOut();
  };

  // Get user display name (use full name, then first+last, then email)
  const fullName = user.user_metadata?.full_name as string;
  const firstName = user.user_metadata?.first_name as string;
  const lastName = user.user_metadata?.last_name as string;
  
  const displayName = fullName ?? 
    (firstName && lastName ? `${firstName} ${lastName}` : 
    (firstName ?? lastName ?? user.email ?? ''));
  
  // Get user avatar URL
  const avatarUrl = user.user_metadata?.avatar_url as string;
  
  // Get initials for avatar fallback
  const initials = firstName && lastName 
    ? `${firstName[0]}${lastName[0]}`
    : displayName.substring(0, 2);

  // Check if a path is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Get the appropriate classes for navigation links
  const getNavLinkClasses = (path: string) => {
    return isActive(path)
      ? "border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
  };

  // Get the appropriate classes for mobile navigation links
  const getMobileNavLinkClasses = (path: string) => {
    return isActive(path)
      ? "bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
      : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium";
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/chat" className="text-xl font-bold text-blue-600">
                ChatApp
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/chat"
                className={getNavLinkClasses('/chat')}
              >
                Chat
              </Link>
              <Link
                href="/groups"
                className={getNavLinkClasses('/groups')}
              >
                Groups
              </Link>
              <Link
                href="/friends"
                className={getNavLinkClasses('/friends')}
              >
                Friends
              </Link>
              <Link
                href="/settings"
                className={getNavLinkClasses('/settings')}
              >
                Settings
              </Link>
            </nav>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">{displayName}</span>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    <Avatar 
                      src={avatarUrl} 
                      alt={`${displayName}'s avatar`}
                      fallback={initials}
                      size="sm"
                    />
                  </button>
                  
                  {isMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Link
                        href="/profile"
                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${isActive('/profile') ? 'bg-gray-100' : ''}`}
                      >
                        Your Profile
                      </Link>
                      <Link
                        href="/settings"
                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${isActive('/settings') ? 'bg-gray-100' : ''}`}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/chat"
              className={getMobileNavLinkClasses('/chat')}
            >
              Chat
            </Link>
            <Link
              href="/groups"
              className={getMobileNavLinkClasses('/groups')}
            >
              Groups
            </Link>
            <Link
              href="/friends"
              className={getMobileNavLinkClasses('/friends')}
            >
              Friends
            </Link>
            <Link
              href="/settings"
              className={getMobileNavLinkClasses('/settings')}
            >
              Settings
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <Avatar 
                  src={avatarUrl} 
                  alt={`${displayName}'s avatar`}
                  fallback={initials}
                  size="md"
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{displayName}</div>
                <div className="text-sm font-medium text-gray-500">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                className={`block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 ${isActive('/profile') ? 'bg-gray-100 text-gray-800' : ''}`}
              >
                Your Profile
              </Link>
              <Link
                href="/settings"
                className={`block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 ${isActive('/settings') ? 'bg-gray-100 text-gray-800' : ''}`}
              >
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 