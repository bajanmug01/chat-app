'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Avatar from '../../../components/Avatar';
import Header from '../../../components/Header';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

// Mock data for chat messages
type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
};

// Mock contacts data
const contacts = [
  {
    id: "1",
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatar: "https://i.pravatar.cc/150?u=3",
  },
  {
    id: "4",
    name: "Sarah Williams",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
  {
    id: "5",
    name: "David Brown",
    avatar: "https://i.pravatar.cc/150?u=5",
  },
];

// Mock messages data
const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      senderId: "1",
      content: "Hey there! How are you doing?",
      timestamp: "2023-03-07T10:15:00",
      isRead: true,
    },
    {
      id: "m2",
      senderId: "currentUser",
      content: "I'm good, thanks! How about you?",
      timestamp: "2023-03-07T10:20:00",
      isRead: true,
    },
    {
      id: "m3",
      senderId: "1",
      content: "Doing well! Just wanted to check in.",
      timestamp: "2023-03-07T10:25:00",
      isRead: true,
    },
    {
      id: "m4",
      senderId: "1",
      content: "Are we still meeting tomorrow?",
      timestamp: "2023-03-07T10:30:00",
      isRead: false,
    },
  ],
  "2": [
    {
      id: "m5",
      senderId: "currentUser",
      content: "Hi Jane, did you get a chance to review the document I sent?",
      timestamp: "2023-03-06T15:30:00",
      isRead: true,
    },
    {
      id: "m6",
      senderId: "2",
      content: "Yes, I did! It looks great.",
      timestamp: "2023-03-06T15:45:00",
      isRead: true,
    },
  ],
  "3": [
    {
      id: "m7",
      senderId: "3",
      content: "Meeting in 10 minutes!",
      timestamp: "2023-03-07T09:00:00",
      isRead: true,
    },
    {
      id: "m8",
      senderId: "currentUser",
      content: "I'll be there!",
      timestamp: "2023-03-07T09:05:00",
      isRead: true,
    },
    {
      id: "m9",
      senderId: "3",
      content: "Great, see you in the conference room.",
      timestamp: "2023-03-07T09:10:00",
      isRead: true,
    },
    {
      id: "m10",
      senderId: "3",
      content: "Don't forget to bring your laptop!",
      timestamp: "2023-03-07T09:15:00",
      isRead: false,
    },
  ],
  "4": [
    {
      id: "m11",
      senderId: "4",
      content: "Can you help me with the project?",
      timestamp: "2023-03-05T18:20:00",
      isRead: false,
    },
  ],
  "5": [
    {
      id: "m12",
      senderId: "currentUser",
      content: "Hey David, are you available for a call?",
      timestamp: "2023-03-04T11:00:00",
      isRead: true,
    },
    {
      id: "m13",
      senderId: "5",
      content: "Sure, I'm free now!",
      timestamp: "2023-03-04T11:10:00",
      isRead: true,
    },
  ],
};

export default function ChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages[contactId] ?? []);
  
  const contact = contacts.find(c => c.id === contactId);
  
  if (!contact) {
    return (
      <ProtectedRoute>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Chat not found</h1>
            <Button onClick={() => router.push('/chat')}>Back to Chats</Button>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: 'currentUser',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true,
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  return (
    <ProtectedRoute>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Chat header */}
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="mr-2" 
                onClick={() => router.push('/chat')}
              >
                ←
              </Button>
              <Avatar 
                src={contact.avatar}
                alt={`${contact.name} avatar`}
                fallback={contact.name}
                size="md"
              />
              <div>
                <h2 className="font-bold">{contact.name}</h2>
                <p className="text-sm text-gray-500">
                  {messages.length > 0 ? 'Active now' : 'Offline'}
                </p>
              </div>
            </div>
          </div>

          {/* Chat messages */}
          <div className="p-4 h-[calc(100vh-300px)] overflow-y-auto flex flex-col space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.senderId === 'currentUser' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.senderId === 'currentUser' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === 'currentUser' 
                      ? 'text-blue-100' 
                      : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Send</Button>
            </form>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
} 