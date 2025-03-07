"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Avatar from "./Avatar";

interface HeaderProps {
  user?: User; // Make user optional since we'll get it from context if not provided
}

export default function Header({ user: propUser }: HeaderProps) {
  const { user: contextUser, signOut } = useAuth();
  const user = propUser ?? contextUser; // Use prop user if provided, otherwise use from context
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // If no user is available, don't render the header
  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      // No need to redirect here as the AuthContext will handle it
    } catch (error) {
      console.error("Error signing out:", error);
      // Optionally add user feedback for error
    }
  };

  // Get user display name (use full name, then first+last, then email)
  const fullName = user.user_metadata?.full_name as string;
  const firstName = user.user_metadata?.first_name as string;
  const lastName = user.user_metadata?.last_name as string;

  const displayName =
    fullName ??
    (firstName && lastName
      ? `${firstName} ${lastName}`
      : (firstName ?? lastName ?? user.email ?? ""));

  // Get user avatar URL
  const avatarUrl = user.user_metadata?.avatar_url as string;

  // Get initials for avatar fallback
  const initials =
    firstName && lastName
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/chat" className="text-xl font-bold text-blue-600">
                ChatApp
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/chat" className={getNavLinkClasses("/chat")}>
                Chat
              </Link>
              <Link href="/groups" className={getNavLinkClasses("/groups")}>
                Groups
              </Link>
              <Link href="/friends" className={getNavLinkClasses("/friends")}>
                Friends
              </Link>
              <Link href="/settings" className={getNavLinkClasses("/settings")}>
                Settings
              </Link>
            </nav>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative ml-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {displayName}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Link
                        href="/profile"
                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${isActive("/profile") ? "bg-gray-100" : ""}`}
                      >
                        Your Profile
                      </Link>
                      <Link
                        href="/settings"
                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${isActive("/settings") ? "bg-gray-100" : ""}`}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
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
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            <Link href="/chat" className={getMobileNavLinkClasses("/chat")}>
              Chat
            </Link>
            <Link href="/groups" className={getMobileNavLinkClasses("/groups")}>
              Groups
            </Link>
            <Link
              href="/friends"
              className={getMobileNavLinkClasses("/friends")}
            >
              Friends
            </Link>
            <Link
              href="/settings"
              className={getMobileNavLinkClasses("/settings")}
            >
              Settings
            </Link>
          </div>
          <div className="border-t border-gray-200 pb-3 pt-4">
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
                <div className="text-base font-medium text-gray-800">
                  {displayName}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                className={`block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 ${isActive("/profile") ? "bg-gray-100 text-gray-800" : ""}`}
              >
                Your Profile
              </Link>
              <Link
                href="/settings"
                className={`block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 ${isActive("/settings") ? "bg-gray-100 text-gray-800" : ""}`}
              >
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
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
