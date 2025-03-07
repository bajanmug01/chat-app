"use client";

import Link from "next/link";
import PublicRoute from "../components/PublicRoute";

export default function Home() {
  return (
    <PublicRoute redirectTo="/chat">
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="mb-8 text-3xl font-bold">Welcome to Our Chat App</h1>

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
      </main>
    </PublicRoute>
  );
}
