'use client';

import Header from '../../components/Header';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function ChatPage() {

  return (
    <ProtectedRoute>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Chat</h1>
          
          <p className="text-gray-500">Chat feature coming soon!</p>
        </div>
      </main>
    </ProtectedRoute>
  );
} 