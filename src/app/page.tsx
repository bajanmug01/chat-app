"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Header from "../components/Header";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      setLoading(false);

      // Redirect to chat page if logged in
      if (sessionUser) {
        router.push("/chat");
      }

      // Set up auth state listener
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          const currentUser = session?.user ?? null;
          setUser(currentUser);

          // Redirect to chat page if logged in
          if (currentUser) {
            router.push("/chat");
          }
        },
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    void checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <>
      {user && <Header user={user} />}

      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="mb-8 text-3xl font-bold">Welcome to Our Chat App</h1>

        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg">Redirecting to chat...</p>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link
              href="/signin"
              className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
            >
              Sign Up
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
